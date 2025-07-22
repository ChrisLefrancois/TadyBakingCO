// server/models/Order.js
import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  quantity: {
    type: Number,
    enum: [1, 6, 12],
    required: true,
  },
  pricePerUnit: { type: Number, required: true },  // save price per unit at time of order
});

const orderSchema = new mongoose.Schema({
  items: [orderItemSchema],
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: String,
  deliveryAddress: String,
  paymentMethod: {
    type: String,
    enum: ['cashPickup', 'etransfer', 'online'],
    required: true,
  },
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
  },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
