// backend/routes/items.js
const express = require("express");
const Item = require("../models/Item.js");
const router = express.Router();

// ---------------------------
// GET ALL ITEMS (with populate)
// ---------------------------
router.get("/items", async (req, res) => {
  try {
    const items = await Item.find()
      .populate({
        path: "itemsIncluded.item",
        select: "name imageUrl pricingTiers",
      })
      .lean(); // ⚡ more efficient

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

// ---------------------------
// GET BUNDLE ITEMS ONLY
// ---------------------------
router.get("/items/bundles", async (req, res) => {
  try {
    const bundles = await Item.find({ type: "bundle" })
      .populate({
        path: "itemsIncluded.item",
        select: "name imageUrl pricingTiers",
      })
      .lean();

    res.json(bundles);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bundles" });
  }
});

// ---------------------------
// GET SINGLE ITEM
// ---------------------------
router.get("/items/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate({
        path: "itemsIncluded.item",
        select: "name imageUrl pricingTiers",
      });

    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------------------
// CREATE ITEM
// ---------------------------
router.post("/create", async (req, res) => {
  try {
    const newItem = new Item(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------------
// UPDATE ITEM
// ---------------------------
router.put("/items/:id", async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedItem) return res.status(404).json({ error: "Item not found" });
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ error: "Bad request", details: err.message });
  }
});

// ---------------------------
// DELETE ITEM
// ---------------------------
router.delete("/items/:id", async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ error: "Item not found" });
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
