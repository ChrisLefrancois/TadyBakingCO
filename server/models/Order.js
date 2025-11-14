const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    items: [
      {
        itemId: String,
        name: String,
        qty: Number,
        unitPrice: Number,
        totalPrice: Number,
      },
    ],
    subtotal: Number,
    tax: Number,
    deliveryFee: Number,
    total: Number,

    fulfillmentMethod: String,
    deliveryAddress: String,
    deliveryDistanceKm: Number,

    customerName: String,
    customerEmail: String,
    customerPhone: String,

    stripePaymentIntentId: String,

    // 🆕 ADD ORDER STATUS
    status: {
      type: String,
      enum: ["pending", "preparing", "ready", "out-for-delivery", "cancelled"],
      default: "pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
