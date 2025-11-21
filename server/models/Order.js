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

    // New fields (delivery metadata)
    city: String,
    province: String,
    postalCode: String,
    note: String,

    scheduledFor: {
      type: Date,
      required: true,
    },

    customerName: String,
    customerEmail: String,
    customerPhone: String,

    stripePaymentIntentId: String,

    status: {
      type: String,
      enum: [
        "pending",
        "preparing",
        "ready",
        "out-for-delivery",
        "cancelled",
        "completed",
      ],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
