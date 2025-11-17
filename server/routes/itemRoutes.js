const express = require('express');
const Item = require('../models/Item.js');

const router = express.Router();

// backend/routes/items.js
router.get("/items", async (req, res) => {
  try {
    const items = await Item.find().populate({
      path: "itemsIncluded.item",
      model: "Item",
      select: "name imageUrl pricingTiers",
    });

    console.log("🎉 POPULATED ITEMS:", JSON.stringify(items, null, 2));
    res.json(items);
  } catch (err) {
    console.error("❌ Failed to fetch items:", err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});


// GET all items


// GET single item by ID
router.get('/items/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create new item
router.post('/create', async (req, res) => {
  try {
    const newItem = new Item(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update item by ID
router.put('/items/:id', async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedItem) return res.status(404).json({ error: 'Item not found' });
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ error: 'Bad request', details: err.message });
  }
});

// DELETE item by ID
router.delete('/items/:id', async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});



module.exports = router;
