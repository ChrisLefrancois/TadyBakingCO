const express = require("express");
const router = express.Router();
const BlackoutDate = require("../models/BlackoutDate");


// Middleware (reuse your API key middleware)
const verifyBlackoutApiKey = require("../middleware/verifyBlackoutApiKey");

// GET all blocked days
router.get("/", async (req, res) => {
  try {
    const days = await BlackoutDate.find().lean();
    res.json(days);
  } catch (err) {
    console.error("❌ Blackout GET error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ADD a blocked day
router.post("/", verifyBlackoutApiKey, async (req, res) => {
  try {
    const saved = await BlackoutDate.create(req.body);
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: "Could not save date" });
  }
});

// REMOVE a blocked day
router.delete("/:id", verifyBlackoutApiKey, async (req, res) => {
  await BlackoutDate.findByIdAndDelete(req.params.id);
  res.json({ message: "Date removed" });
});

module.exports = router;
