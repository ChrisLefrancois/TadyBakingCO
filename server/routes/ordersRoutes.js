const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const Order = require("../models/Order");
const axios = require("axios");
const sendEmail = require("../utils/sendEmail");
const fs = require("fs");
const path = require("path");
const generateInvoicePDF = require("../utils/generateInvoicePDF");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const requireAdminAuth = require("../middleware/requireAdminAuth");

// TAX must match frontend
const TAX_RATE = 0.13;

// -------------------------------------------
// SIMPLE API KEY GUARD FOR ORDER ROUTES
// -------------------------------------------
const requireOrderApiKey = (req, res, next) => {
  const configuredKey = process.env.ORDER_API_KEY;

  // If no key configured, don't block (useful for local dev)
  if (!configuredKey) {
    return next();
  }

  const incoming = req.headers["x-api-key"];

  if (!incoming || incoming !== configuredKey) {
    console.warn("🚫 Unauthorized order API access attempt");
    return res.status(403).json({ error: "Unauthorized" });
  }

  next();
};

// ------------------------------------------------------
// 1) CREATE PAYMENT INTENT
// ------------------------------------------------------
router.post("/create-payment-intent",  async (req, res) => {
  try {
    const { items, fulfillmentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No items in cart." });
    }

    const subtotal = items.reduce((sum, p) => sum + p.unitPrice * p.qty, 0);
    const deliveryFee =
      fulfillmentMethod === "delivery" && subtotal < 45 ? 5.99 : 0;

    const tax = Math.round((subtotal + deliveryFee) * TAX_RATE * 100) / 100;


    const total = Math.round((subtotal + tax + deliveryFee) * 100) / 100;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: "cad",
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("❌ Error creating PaymentIntent:", err);
    res.status(500).json({ error: "Failed to create payment intent" });
  }
});

// ------------------------------------------------------
// 2) UPDATE PAYMENT INTENT
// ------------------------------------------------------
router.post("/update-payment-intent", async (req, res) => {
  try {
    const { paymentIntentId, items, fulfillmentMethod } = req.body;

    if (!paymentIntentId)
      return res.status(400).json({ error: "PaymentIntent ID missing." });

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No items in cart." });
    }

    const subtotal = items.reduce((sum, p) => sum + p.unitPrice * p.qty, 0);
    const deliveryFee =
      fulfillmentMethod === "delivery" && subtotal < 45 ? 5.99 : 0;

    const tax = Math.round((subtotal + deliveryFee) * TAX_RATE * 100) / 100;

    const total = Math.round((subtotal + tax + deliveryFee) * 100);

    await stripe.paymentIntents.update(paymentIntentId, { amount: total });

    res.json({ updated: true });
  } catch (err) {
    console.error("❌ Failed updating PaymentIntent:", err);
    res.status(500).json({ error: "Update failed." });
  }
});

// ------------------------------------------------------
// 3) CREATE ORDER (SECURED)
// ------------------------------------------------------
router.post("/", async (req, res) => {
  try {
    const {
      items,
      subtotal,
      tax,
      fulfillmentMethod,
      deliveryAddress,
      deliveryFee,
      total,
      customerName,
      customerEmail,
      customerPhone,
      stripePaymentIntentId,
      city,
      province,
      postalCode,
      scheduledFor,
      note,
    } = req.body;

    // Basic validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No items in order." });
    }

    if (!customerName || !customerEmail || !customerPhone) {
      return res.status(400).json({
        error: "Customer name, email, and phone are required.",
      });
    }

    if (!stripePaymentIntentId) {
      return res.status(400).json({ error: "Missing Stripe payment intent ID." });
    }

    // ---------------------------------------------------
    // VALIDATE STRIPE PAYMENT INTENT
    // ---------------------------------------------------
    let intent;
    try {
      intent = await stripe.paymentIntents.retrieve(stripePaymentIntentId);
    } catch (stripeErr) {
      console.error("❌ Failed to retrieve PaymentIntent:", stripeErr);
      return res.status(400).json({ error: "Invalid payment intent." });
    }

    if (!intent || intent.status !== "succeeded") {
      console.warn(
        "🚫 PaymentIntent not successful:",
        intent && intent.status,
        stripePaymentIntentId
      );
      return res.status(400).json({
        error: "Payment not completed. Please contact support if you were charged.",
      });
    }

    // Optional: verify amount matches
    const expectedAmount = Math.round(total * 100);
    if (intent.amount !== expectedAmount) {
      console.warn(
        `⚠️ Payment amount mismatch. Stripe: ${intent.amount}, expected: ${expectedAmount}`
      );
      // You can choose to reject here if you want it strict:
      // return res.status(400).json({ error: "Payment amount mismatch." });
    }

    // ---------------------------------------------------
    // VALIDATE SCHEDULED TIME
    // ---------------------------------------------------
    if (!scheduledFor) {
      return res.status(400).json({ error: "scheduledFor is required." });
    }

    const scheduled = new Date(scheduledFor);

    if (isNaN(scheduled.getTime())) {
      return res.status(400).json({ error: "Invalid scheduled date/time." });
    }

    const now = new Date();
    const diffHours = (scheduled - now) / (1000 * 60 * 60);

    if (diffHours < 48) {
      return res.status(400).json({
        error: "Orders must be placed at least 48 hours in advance.",
      });
    }

    const h = scheduled.getHours();
    const m = scheduled.getMinutes();

    // Allow 10:00 → 18:00 exactly
    if (h < 10 || h > 18 || (h === 18 && m > 0)) {
      return res.status(400).json({
        error: "Pickup/delivery time must be between 10:00 AM and 6:00 PM.",
      });
    }

    // -------------------------------------------
    // VALIDATE DELIVERY AREA (if delivery)
    // -------------------------------------------
    if (fulfillmentMethod === "delivery") {
      const allowedCities = [
        "whitby",
        "ajax",
        "oshawa",
        "pickering",
        "scarborough",
      ];

      const cityLower = (city || "").toLowerCase().trim();

      if (!allowedCities.includes(cityLower)) {
        return res.status(400).json({
          error:
            "Delivery is only available in Ajax, Whitby, Oshawa, Pickering, or Scarborough.",
        });
      }
    }

    // ---------------------------------------------------
    // SAVE ORDER
    // ---------------------------------------------------
    const order = new Order({
      items,
      subtotal,
      tax,
      deliveryFee,
      total,
      fulfillmentMethod,
      deliveryAddress,
      customerName,
      customerEmail,
      customerPhone,
      stripePaymentIntentId,
      city,
      province,
      postalCode,
      scheduledFor,
      status: "pending",
      note,
    });

    const saved = await order.save();

    // ---------------------------------------------------
    // EMAIL ITEMS LIST
    // ---------------------------------------------------
    const itemsList = items
      .map(
        (item) =>
          `<li>${item.qty} × ${item.name} — $${item.totalPrice.toFixed(2)}</li>`
      )
      .join("");

    // Format scheduled time for email
    const scheduledStr = new Date(saved.scheduledFor).toLocaleString("en-CA", {
      timeZone: "America/Toronto",
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // ---------------------------------------------------
    // CUSTOMER EMAIL
    // ---------------------------------------------------
    const PICKUP_ADDRESS = "3 Mackeller Ct, Ajax, Ontario L1T 0G2";

    const customerHtml = `
    <div style="background:#fbf1e5; padding:40px 10px; font-family:Arial, sans-serif;">
      <div style="max-width:600px; margin:0 auto; background:white; border-radius:20px; padding:30px; border:1px solid #e5cbc7;">
        <h1 style="text-align:center; color:#4b2e24;">🍪 Thank You for Your Order!</h1>

        <p style="font-size:16px;">Hi <strong>${customerName}</strong>,</p>
        <p>Your order has been received and is now being prepared!</p>

        <div style="background:#f7e7da; padding:20px; border-radius:15px; margin:25px 0;">
          <p><strong>Order #:</strong> ${saved._id}</p>
          <p><strong>Total:</strong> $${total.toFixed(2)}</p>
          <p><strong>Method:</strong> ${fulfillmentMethod}</p>
          <p><strong>Scheduled For:</strong> ${scheduledStr}</p>
          <p><strong>Note:</strong> ${note}</p>

          ${
            fulfillmentMethod === "delivery"
              ? `<p><strong>Delivery Address:</strong><br>${deliveryAddress}</p>`
              : `<p><strong>Pickup Address:</strong><br>${PICKUP_ADDRESS}</p>`
          }
        </div>

        <h2 style="color:#4b2e24;">Your Items</h2>
        <ul>${itemsList}</ul>

        ${
          fulfillmentMethod === "pickup"
            ? `<p style="margin-top:20px;">We will send you another email when your order is <strong>ready for pickup</strong>.</p>`
            : `<p style="margin-top:20px;">We will notify you when your order is <strong>out for delivery</strong>.</p>`
        }
      </div>
    </div>`;

    // ---------------------------------------------------
    // ADMIN EMAIL
    // ---------------------------------------------------
    const adminHtml = `
<div style="font-family:Arial, sans-serif;">
  <h2>🍪 New Order</h2>
  <p><strong>Order ID:</strong> ${saved._id}</p>
  <p><strong>Name:</strong> ${customerName}</p>
  <p><strong>Email:</strong> ${customerEmail}</p>
  <p><strong>Total:</strong> $${total.toFixed(2)}</p>
  <p><strong>Scheduled For:</strong> ${scheduledStr}</p>
  <p><strong>Method:</strong> ${fulfillmentMethod}</p>
  <p><strong>Note:</strong> ${note}</p>

  ${
    fulfillmentMethod === "delivery"
      ? `<p><strong>Delivery Address:</strong> ${deliveryAddress}</p>`
      : `<p><strong>Pickup:</strong> Montréal</p>`
  }

  <h3>Items</h3>
  <ul>${itemsList}</ul>
</div>`;

    // ------ PDF INVOICE ------
    let attachments = [];
    let receiptPath = null;

    try {
      receiptPath = await generateInvoicePDF(saved);
      if (receiptPath && fs.existsSync(receiptPath)) {
        attachments = [
          {
            filename: `receipt_TBC-${String(saved._id).slice(-6).toUpperCase()}.pdf`,
            path: receiptPath,
            contentType: "application/pdf",
          },
        ];
      }
      console.log("📄 RECEIPT READY:", receiptPath);
    } catch (error) {
      console.warn("⚠️ Receipt PDF failed:", error);
    }

    // Send emails (non-blocking)
    sendEmail({
      to: customerEmail,
      subject: `Your Tady Baking Co Order (#${saved._id})`,
      html: customerHtml,
      attachments,
    }).catch((err) => console.error("❌ Customer email failed:", err));

    sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `🍪 New Order (#${saved._id})`,
      html: adminHtml,
      attachments,
    }).catch((err) => console.error("❌ Admin email failed:", err));

    return res.status(201).json(saved);
  } catch (err) {
    console.error("❌ Error saving order:", err);

    return res.status(400).json({
      message: err.message,
      error: err,
    });
  }
});

// ------------------------------------------------------
// 4) GET ALL ORDERS
// ------------------------------------------------------
router.get("/", requireOrderApiKey, requireAdminAuth, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("❌ Fetch orders failed:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// ------------------------------------------------------
// 4b) DOWNLOAD RECEIPT PDF (Admin)
// GET /api/orders/:id/receipt
// ------------------------------------------------------
router.get("/:id/receipt", requireOrderApiKey, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    const receiptNumber = `TBC-${String(order._id).slice(-6).toUpperCase()}`;
    const filePath = path.join(
      __dirname,
      "..",
      "temp",
      `receipt_${receiptNumber}.pdf`
    );

    // If not present, regenerate
    if (!fs.existsSync(filePath)) {
      console.log("Receipt missing on disk, regenerating...");
      await generateInvoicePDF(order);
    }

    if (!fs.existsSync(filePath)) {
      return res
        .status(404)
        .json({ error: "Receipt not available. Try again later." });
    }

    res.sendFile(path.resolve(filePath));
  } catch (err) {
    console.error("❌ Failed to download receipt:", err);
    res.status(500).json({ error: "Failed to download receipt" });
  }
});

// ------------------------------------------------------
// 5b) RESEND RECEIPT EMAIL (Admin)
// POST /api/orders/:id/resend-receipt
// ------------------------------------------------------
router.post("/:id/resend-receipt", requireOrderApiKey, requireAdminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    // Regenerate or ensure receipt exists
    const receiptPath = await generateInvoicePDF(order);
    let attachments = [];
    if (receiptPath && fs.existsSync(receiptPath)) {
      attachments = [
        {
          filename: `receipt_TBC-${String(order._id).slice(-6).toUpperCase()}.pdf`,
          path: receiptPath,
          contentType: "application/pdf",
        },
      ];
    }

    const itemsList = order.items
      .map(
        (item) =>
          `<li>${item.qty} × ${item.name} — $${item.totalPrice.toFixed(2)}</li>`
      )
      .join("");

    const scheduledStr = new Date(order.scheduledFor).toLocaleString("en-CA", {
      timeZone: "America/Toronto",
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const PICKUP_ADDRESS = "3 Mackeller Ct, Ajax, Ontario L1T 0G2";

    const html = `
      <h1>🧾 Your Tady Baking Co Receipt (Resent)</h1>
      <p>Hi ${order.customerName}, here is a copy of your receipt.</p>
      <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
      <p><strong>Scheduled For:</strong> ${scheduledStr}</p>
      ${
        order.fulfillmentMethod === "delivery"
          ? `<p><strong>Delivery Address:</strong> ${order.deliveryAddress}</p>`
          : `<p><strong>Pickup Address:</strong> ${PICKUP_ADDRESS}</p>`
      }
      <h3>Items</h3>
      <ul>${itemsList}</ul>
    `;

    sendEmail({
      to: order.customerEmail,
      subject: `Your Tady Baking Co Receipt (Resent)`,
      html,
      attachments,
    }).catch((err) => console.error("❌ Resend receipt failed:", err));

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Failed to resend receipt:", err);
    res.status(500).json({ error: "Failed to resend receipt" });
  }
});

// ------------------------------------------------------
// 5) UPDATE ORDER STATUS
// ------------------------------------------------------
router.put("/:id/status", requireOrderApiKey, requireAdminAuth, async (req, res) => {
  try {
    const { status } = req.body;

    const allowed = [
      "pending",
      "preparing",
      "ready",
      "out-for-delivery",
      "completed",
      "cancelled",
    ];

    if (!allowed.includes(status))
      return res.status(400).json({ error: "Invalid order status." });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.status = status;
    await order.save();

    // Notify only for these statuses
    const shouldNotify =
      status === "ready" ||
      status === "out-for-delivery" ||
      status === "cancelled";

    if (shouldNotify) {
      let subject = "";
      let message = "";

      if (status === "ready") {
        subject = `🍪 Your Tady Baking Co Order is Ready! (#${order._id})`;

        const PICKUP_ADDRESS = "3 Mackeller Ct, Ajax, Ontario L1T 0G2";

        const scheduledStr = new Date(order.scheduledFor).toLocaleString(
          "en-CA",
          {
            timeZone: "America/Toronto",
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }
        );

        message = `
          <p>Your order is now <strong>ready for pickup!</strong> 🎉</p>
          <p><strong>Pickup Address:</strong><br>${PICKUP_ADDRESS}</p>
          <p><strong>Pickup Time:</strong> ${scheduledStr}</p>
          <p>Thank you for supporting Tady Baking Co! 🍪</p>
        `;
      }

      if (status === "out-for-delivery") {
        subject = `🚚 Your Cookies Are On The Way! (#${order._id})`;
        message = `<p>Your cookies are on the way to: ${order.deliveryAddress}</p>`;
      }

      if (status === "cancelled") {
        subject = `⚠️ Your Order Has Been Cancelled (#${order._id})`;
        message = `<p>Your order has been cancelled.</p>`;
      }

      sendEmail({
        to: order.customerEmail,
        subject,
        html: message,
      }).catch((err) => console.error("❌ Status email failed:", err));
    }

    res.json(order);
  } catch (err) {
    console.error("❌ Failed to update order status:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
});

// ------------------------------------------------------
// 6) GET SINGLE ORDER
// ------------------------------------------------------
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    console.error("❌ Fetch single order failed:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ------------------------------------------------------
// 7) CHECK DELIVERY DISTANCE
// ------------------------------------------------------
router.post("/check-distance", requireOrderApiKey, requireAdminAuth, async (req, res) => {
  try {
    const { address } = req.body;

    if (!address)
      return res.status(400).json({ error: "Address required" });

    const SHOP_ADDRESS = "3 Mackeller Ct, Ajax, Ontario L1T 0G2";
    const MAX_DISTANCE_KM = 12;

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${encodeURIComponent(
      SHOP_ADDRESS
    )}&destinations=${encodeURIComponent(address)}&key=${
      process.env.GOOGLE_MAPS_API_KEY
    }`;

    const response = await axios.get(url);
    const data = response.data;

    const element = data?.rows?.[0]?.elements?.[0];

    if (!element || element.status !== "OK" || !element.distance) {
      return res.status(400).json({
        error: "Could not calculate distance. Please provide a valid address.",
      });
    }

    const km = element.distance.value / 1000;

    res.json({
      distanceKm: Number(km.toFixed(2)),
      allowed: km <= MAX_DISTANCE_KM,
    });
  } catch (err) {
    console.error("Distance check failed:", err);
    res.status(500).json({ error: "Failed to check distance" });
  }
});

module.exports = router;
