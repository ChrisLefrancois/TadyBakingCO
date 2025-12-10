const express = require("express");
const Item = require("../models/Item.js");
const upload = require("../middleware/Upload.js"); // ⬅️ NEW
const router = express.Router();

router.use((req, res, next) => {
  console.log("📥 ITEMS ROUTE HIT:", req.method, req.originalUrl);
  next();
});


// -----------------------------------------
// 🔐 Middleware: Protect Mutating Routes
// -----------------------------------------
function verifyApiKey(req, res, next) {
  const key = req.headers["x-api-key"];

  if (!key || key !== process.env.ITEMS_API_KEY) {
    return res.status(403).json({ error: "Forbidden: Invalid API key" });
  }

  next();
}

// -----------------------------------------
// ⭐ PUBLIC ROUTES
// -----------------------------------------

// GET ALL ITEMS
router.get("/items", async (req, res) => {
  try {
    const items = await Item.find()
      .populate({
        path: "itemsIncluded.item",
        select: "name imageUrl pricingTiers",
      })
      .lean();

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

// GET ALL BUNDLES
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

// GET SINGLE ITEM
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

// -----------------------------------------
// 🔐 PROTECTED ADMIN ROUTES
// -----------------------------------------

// CREATE ITEM (image upload + JSON fields)
router.post(
  "/create",
  upload.single("image"),
  async (req, res) => {
    try {
      console.log("🔥 Creating item:", req.body);

      // Parse JSON fields
      const pricingTiers = JSON.parse(req.body.pricingTiers || "[]");
      const itemsIncluded = JSON.parse(req.body.itemsIncluded || "[]");

      // Build item object
      const newItemData = {
        type: req.body.type,
        name: req.body.name,
        description: req.body.description,
        pricingTiers,
        itemsIncluded,
        bundlePrice: req.body.bundlePrice || null,
        bundleSave: req.body.bundleSave || null,
        imageUrl: req.file ? req.file.path : null,  // ⭐ CLOUDINARY URL
      };

      console.log("📝 Final item object:", newItemData);

      const savedItem = await Item.create(newItemData);
      console.log("✅ Item saved", savedItem._id);

      res.status(201).json(savedItem);

    } catch (err) {
      console.error("❌ CREATE ITEM ERROR:", err);
      res.status(500).json({ error: "Failed to save item", details: err.message });
    }
  }
);





// UPDATE ITEM
router.put("/items/:id", verifyApiKey, upload.single("image"), async (req, res) => {
  try {
    const body = req.body;

    // Parse JSON fields
    if (body.pricingTiers) body.pricingTiers = JSON.parse(body.pricingTiers);
    if (body.itemsIncluded) body.itemsIncluded = JSON.parse(body.itemsIncluded);

    // New file? override imageUrl
    if (req.file) {
      body.imageUrl = req.file.path;
    }

    const updatedItem = await Item.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedItem) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json(updatedItem);
  } catch (err) {
    console.error("❌ Update Item Error:", err);
    res.status(400).json({ error: "Failed to update item", details: err.message });
  }
});


// DELETE ITEM
router.delete("/items/:id", verifyApiKey, async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ error: "Item not found" });
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
