const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const Order = require("../models/Order");
const axios = require("axios");
const sendEmail = require("../utils/sendEmail");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// TAX must match frontend
const TAX_RATE = 0.13;

// ------------------------------------------------------
// 1) CREATE PAYMENT INTENT
// ------------------------------------------------------
router.post("/create-payment-intent", async (req, res) => {
  try {
    const { items, fulfillmentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No items in cart." });
    }

    const subtotal = items.reduce((sum, p) => sum + p.unitPrice * p.qty, 0);
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    const deliveryFee =
      fulfillmentMethod === "delivery" && subtotal < 45 ? 5.99 : 0;

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

    const subtotal = items.reduce((sum, p) => sum + p.unitPrice * p.qty, 0);
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    const deliveryFee =
      fulfillmentMethod === "delivery" && subtotal < 45 ? 5.99 : 0;

    const total = Math.round((subtotal + tax + deliveryFee) * 100);

    await stripe.paymentIntents.update(paymentIntentId, { amount: total });

    res.json({ updated: true });
  } catch (err) {
    console.error("❌ Failed updating PaymentIntent:", err);
    res.status(500).json({ error: "Update failed." });
  }
});

// ------------------------------------------------------
// 3) CREATE ORDER
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
    } = req.body;

    if (!customerName || !customerEmail || !customerPhone)
      return res.status(400).json({
        error: "Customer name, email, and phone are required.",
      });

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
        error: "Orders must be placed at least 24 hours in advance.",
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
    const customerHtml = `
<div style="background:#fbf1e5; padding:40px 10px; font-family:Arial, sans-serif;">
  <div style="max-width:600px; margin:0 auto; background:white; border-radius:20px; padding:30px; border:1px solid #e5cbc7;">
    <h1 style="text-align:center; color:#4b2e24;">🍪 Thank You for Your Order!</h1>

    <p style="font-size:16px;">Hi <strong>${customerName}</strong>,</p>
    <p>Your delicious cookies are being prepared.</p>

    <div style="background:#f7e7da; padding:20px; border-radius:15px; margin:25px 0;">
      <p><strong>Order #:</strong> ${saved._id}</p>
      <p><strong>Total:</strong> $${total.toFixed(2)}</p>
      <p><strong>Method:</strong> ${fulfillmentMethod}</p>
      <p><strong>Scheduled For:</strong> ${scheduledStr}</p>

      ${
        fulfillmentMethod === "delivery"
          ? `<p><strong>Delivery Address:</strong><br>${deliveryAddress}</p>`
          : `<p><strong>Pickup Location:</strong> Montréal</p>`
      }
    </div>

    <h2 style="color:#4b2e24;">Your Items</h2>
    <ul>${itemsList}</ul>
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

  ${
    fulfillmentMethod === "delivery"
      ? `<p><strong>Delivery Address:</strong> ${deliveryAddress}</p>`
      : `<p><strong>Pickup:</strong> Montréal</p>`
  }

  <h3>Items</h3>
  <ul>${itemsList}</ul>
</div>`;

    await sendEmail({
      to: customerEmail,
      subject: `Your Tady Baking Co Order (#${saved._id})`,
      html: customerHtml,
    });

    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `🍪 New Order (#${saved._id})`,
      html: adminHtml,
    });

    return res.status(201).json(saved);
  } catch (err) {
    console.error("❌ Error saving order:", err);
    res.status(500).json({ error: "Failed to save order" });
  }
});

// ------------------------------------------------------
// 4) GET ALL ORDERS
// ------------------------------------------------------
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("❌ Fetch orders failed:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// ------------------------------------------------------
// 5) UPDATE ORDER STATUS
// ------------------------------------------------------
router.put("/:id/status", async (req, res) => {
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
        message = `<p>Your order is ready for pickup!</p>`;
      }

      if (status === "out-for-delivery") {
        subject = `🚚 Your Cookies Are On The Way! (#${order._id})`;
        message = `<p>Your cookies are on the way to: ${order.deliveryAddress}</p>`;
      }

      if (status === "cancelled") {
        subject = `⚠️ Your Order Has Been Cancelled (#${order._id})`;
        message = `<p>Your order has been cancelled.</p>`;
      }

      await sendEmail({
        to: order.customerEmail,
        subject,
        html: message,
      });
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
router.post("/check-distance", async (req, res) => {
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
