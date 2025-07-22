// server/models/Item.js
import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  imageUrl: String,
  priceSingle: { type: Number, required: true },    // price for 1 unit
  priceSixPack: { type: Number, required: true },   // price for 6 units
  priceTwelvePack: { type: Number, required: true },// price for 12 units
  createdAt: { type: Date, default: Date.now },
});

const Item = mongoose.model('Item', itemSchema);
export default Item;
