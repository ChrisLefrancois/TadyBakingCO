const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const Order = require("../models/Order");
const sendEmail = require("../utils/sendEmail");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// TAX rate must match frontend
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
      fulfillmentMethod === "delivery" ? (subtotal < 45 ? 5.99 : 0) : 0;

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
// 2) UPDATE PAYMENT INTENT WHEN CART CHANGES
// ------------------------------------------------------
router.post("/update-payment-intent", async (req, res) => {
  try {
    const { paymentIntentId, items, fulfillmentMethod } = req.body;

    if (!paymentIntentId)
      return res.status(400).json({ error: "PaymentIntent ID missing." });

    let subtotal = items.reduce((sum, p) => sum + p.unitPrice * p.qty, 0);
    let deliveryFee =
      fulfillmentMethod === "delivery" && subtotal < 45 ? 5.99 : 0;
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;

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
      deliveryDistanceKm,
      deliveryFee,
      total,
      customerName,
      customerEmail,
      customerPhone,
      stripePaymentIntentId,
    } = req.body;

    if (!customerName || !customerEmail || !customerPhone) {
      return res.status(400).json({
        error: "Customer name, email, and phone are required.",
      });
    }

    const order = new Order({
      items,
      subtotal,
      tax,
      deliveryFee,
      total,
      fulfillmentMethod,
      deliveryAddress,
      deliveryDistanceKm,
      customerName,
      customerEmail,
      customerPhone,
      stripePaymentIntentId,
      status: "pending",
    });

    const saved = await order.save();

    // ----------------------------------------------------------
    // FORMAT ITEMS LIST FOR EMAIL
    // ----------------------------------------------------------
    const itemsList = items
      .map(
        (item) =>
          `<li>${item.qty} × ${item.name} — $${item.totalPrice.toFixed(2)}</li>`
      )
      .join("");

    // ----------------------------------------------------------
    // 🎉 CUSTOMER EMAIL
    // ----------------------------------------------------------
    const customerHtml = `
<div style="background:#fbf1e5; padding:40px 10px; font-family:Arial, sans-serif;">
  <div style="max-width:600px; margin:0 auto; background:white; border-radius:20px; padding:30px; border:1px solid #e5cbc7;">

    <h1 style="text-align:center; color:#4b2e24; margin-top:0;">
      🍪 Thank You for Your Order!
    </h1>

    <p style="font-size:16px; color:#4b2e24;">
      Hi <strong>${customerName}</strong>,
      <br><br>
      We've received your order and started baking your delicious cookies!
    </p>

    <div style="
      background:#f7e7da;
      padding:20px;
      border-radius:15px;
      margin:25px 0;
      border-left:6px solid #b67c5a;">

      <p><strong>Order #:</strong> ${saved._id}</p>
      <p><strong>Total:</strong> $${total.toFixed(2)}</p>
      <p><strong>Method:</strong> ${fulfillmentMethod}</p>

      ${
        fulfillmentMethod === "delivery"
          ? `<p><strong>Delivery Address:</strong><br>${deliveryAddress}</p>`
          : `<p><strong>Pickup Location:</strong> Montréal</p>`
      }
    </div>

    <h2 style="color:#4b2e24;">Your Items</h2>
    <ul style="padding-left:20px; color:#4b2e24; font-size:15px;">
      ${itemsList}
    </ul>

    <p style="margin-top:20px; color:#4b2e24;">
      You'll receive an update when your order is ready!
    </p>

    <hr style="border:0; border-top:1px solid #e5cbc7; margin:30px 0;">

    <p style="font-size:13px; text-align:center; color:#806154;">
      Tady Baking Co • Montréal, QC
      <br>
      Call/Text: <strong>(365) 800-6867</strong>
    </p>
  </div>
</div>
`;

    // ----------------------------------------------------------
    // 👩‍🍳 ADMIN EMAIL
    // ----------------------------------------------------------
    const adminHtml = `
<div style="font-family: Arial, sans-serif; background:#faf0e8; padding:30px;">
  <h2 style="color:#4b2e24;">🍪 New Order Received</h2>

  <p><strong>Order ID:</strong> ${saved._id}</p>
  <p><strong>Name:</strong> ${customerName}</p>
  <p><strong>Email:</strong> ${customerEmail}</p>
  <p><strong>Total:</strong> $${total.toFixed(2)}</p>
  <p><strong>Method:</strong> ${fulfillmentMethod}</p>

  ${
    fulfillmentMethod === "delivery"
      ? `<p><strong>Delivery Address:</strong> ${deliveryAddress}</p>`
      : `<p><strong>Pickup:</strong> Montréal</p>`
  }

  <h3 style="margin-top:20px; color:#4b2e24;">Items</h3>
  <ul>${itemsList}</ul>
</div>
`;

    // ----------------------------------------------------------
    // ✉ SEND EMAILS
    // ----------------------------------------------------------
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
// ------------------------------------------------------
// 5) ADMIN – UPDATE ORDER STATUS + send email if needed
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

    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Invalid order status." });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.status = status;
    await order.save();

    // ----------------------------------------------------
    // ✉️ SEND EMAIL ONLY FOR:
    // ready, out-for-delivery, cancelled
    // ----------------------------------------------------
    const shouldNotify =
      status === "ready" || status === "out-for-delivery" || status === "cancelled";

    if (shouldNotify) {
      let subject = "";
      let message = "";

      if (status === "ready") {
        subject = `🍪 Your Tady Baking Co Order is Ready! (#${order._id})`;
        message = `
          <div style="font-family:Arial; background:#fbf1e5; padding:20px;">
            <h2 style="color:#4b2e24;">🍪 Your Order is Ready!</h2>
            <p>Hi <strong>${order.customerName}</strong>,</p>
            <p>Your cookies are freshly baked and ready for pickup!</p>

            <div style="margin-top:20px;">
              <p><strong>Pickup Location:</strong> Montréal</p>
              <p><strong>Order #:</strong> ${order._id}</p>
            </div>

            <p style="margin-top:20px;">See you soon! 💛</p>
          </div>
        `;
      }

      if (status === "out-for-delivery") {
        subject = `🚚 Your Cookies Are On The Way! (#${order._id})`;
        message = `
          <div style="font-family:Arial; background:#fbf1e5; padding:20px;">
            <h2 style="color:#4b2e24;">🚚 Out for Delivery!</h2>
            <p>Hi <strong>${order.customerName}</strong>,</p>
            <p>Your cookies are on their way. They'll arrive shortly!</p>
            <p><strong>Delivery Address:</strong> ${order.deliveryAddress}</p>
          </div>
        `;
      }

      if (status === "cancelled") {
        subject = `⚠️ Your Order Has Been Cancelled (#${order._id})`;
        message = `
          <div style="font-family:Arial; background:#fbf1e5; padding:20px;">
            <h2 style="color:#4b2e24;">⚠️ Order Cancelled</h2>
            <p>Hi <strong>${order.customerName}</strong>,</p>
            <p>Your order has been cancelled. If this was a mistake, feel free to contact us.</p>
            <p><strong>Order #:</strong> ${order._id}</p>
          </div>
        `;
      }

      await sendEmail({
        to: order.customerEmail,
        subject,
        html: message,
      });
    }

    return res.json(order);

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

module.exports = router;
