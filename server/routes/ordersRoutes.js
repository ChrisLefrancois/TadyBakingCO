const express = require("express");
const router = express.Router();
const Order = require("../models/Order.js");

// POST /api/orders
router.post("/", async (req, res) => {
  try {
    const {
      items,
      subtotal,
      tax,
      fulfillmentMethod,
      deliveryAddress,
      deliveryDistanceKm,
      customerName,
      customerEmail,
      customerPhone,
      stripePaymentIntentId,
    } = req.body;

    // ✅ Basic validation
    if (!customerName || !customerEmail || !customerPhone) {
      return res.status(400).json({
        error: "Customer name, email, and phone are required.",
      });
    }

    // 🚚 Delivery fee logic
    let deliveryFee = 0;
    if (fulfillmentMethod === "delivery") {
      if (subtotal < 45) deliveryFee = 5.99;
    }

    // 💰 Calculate total with proper rounding
    const finalTotal = +(subtotal + tax + deliveryFee).toFixed(2);

    // 🧾 Create new order
    const order = new Order({
      items,
      subtotal,
      tax,
      deliveryFee,
      total: finalTotal,
      fulfillmentMethod,
      deliveryAddress,
      deliveryDistanceKm,
      customerName,
      customerEmail,
      customerPhone,
      stripePaymentIntentId,
    });

    const saved = await order.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Error saving order:", err);
    res.status(500).json({ error: "Failed to save order" });
  }
});

// GET /api/orders/:id
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    console.error("❌ Failed to fetch order:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;
