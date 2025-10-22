const mongoose = require("mongoose");

const pricingTierSchema = new mongoose.Schema({
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const includedItemSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true }, // ✅ reference to an Item
  quantity: { type: Number, default: 1 },
});

const itemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["single", "bundle"],
    default: "single",
  },

  name: { type: String, required: true },
  description: String,
  imageUrl: String,
  pricingTiers: [pricingTierSchema],

  // ✅ references actual items
  itemsIncluded: [includedItemSchema],
  bundlePrice: Number,
  bundleSave: Number,

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Item", itemSchema);
