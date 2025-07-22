import express from 'express';
import Item from './models/Item.js';
import Order from './models/Order.js';

const router = express.Router();

// Helper function to calculate price breakdown
function calculatePriceForQuantity(item, totalQty) {
  let qtyLeft = totalQty;
  let totalPrice = 0;
  const breakdown = [];

  const packs = [
    { qty: 12, price: item.priceTwelvePack },
    { qty: 6, price: item.priceSixPack },
    { qty: 1, price: item.priceSingle },
  ];

  for (const pack of packs) {
    const count = Math.floor(qtyLeft / pack.qty);
    if (count > 0) {
      totalPrice += count * pack.price;
      qtyLeft -= count * pack.qty;
      breakdown.push({ qty: pack.qty, count });
    }
  }

  return { totalPrice, breakdown };
}

// POST /orders
router.post('/orders', async (req, res) => {
  try {
    const {
      items,            // [{ itemId, quantity }]
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      paymentMethod,
    } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ error: 'Order must have at least one item.' });
    }

    let orderItems = [];
    let totalOrderPrice = 0;

    // Fetch each item from DB, calculate price & build order items array
    for (const orderItem of items) {
      const item = await Item.findById(orderItem.itemId);
      if (!item) return res.status(404).json({ error: `Item ${orderItem.itemId} not found` });

      const { totalPrice, breakdown } = calculatePriceForQuantity(item, orderItem.quantity);

      // Calculate price per unit average (optional)
      const pricePerUnit = totalPrice / orderItem.quantity;

      orderItems.push({
        item: item._id,
        quantity: orderItem.quantity,
        pricePerUnit,
        priceBreakdown: breakdown,  // Optional, store how price was computed
      });

      totalOrderPrice += totalPrice;
    }

    const order = new Order({
      items: orderItems,
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      paymentMethod,
      totalPrice: totalOrderPrice,
      status: 'pending',
    });

    await order.save();

    res.status(201).json({ message: 'Order created', orderId: order._id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
