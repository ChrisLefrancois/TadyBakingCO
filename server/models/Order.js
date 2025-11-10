const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  items: [
    {
      name: { type: String, required: true },
      qty: { type: Number, required: true },
      unitPrice: { type: Number, required: true },
      totalPrice: { type: Number, required: true },
      itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item" }, // 👈 not required
    },
  ],
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  total: { type: Number, required: true },
  fulfillmentMethod: { type: String, enum: ["pickup", "delivery"], required: true },
  deliveryAddress: { type: String },
  deliveryDistanceKm: { type: Number },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },
  stripePaymentIntentId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
