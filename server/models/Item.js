// server/models/Item.js
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  imageUrl: String,
  priceSingle: { type: Number, required: true },    // price for 1 unit
  priceTwoPack: { type: Number },    // price for 1 unit
  priceFourPack: { type: Number },    // price for 1 unit
  priceSixPack: { type: Number },   // price for 6 units
  priceTwelvePack: { type: Number },// price for 12 units
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Item', itemSchema)
