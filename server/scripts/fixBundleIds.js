// scripts/fixBundleIds.js
require("dotenv").config();
const mongoose = require("mongoose");
const Item = require("../models/Item.js");

async function run() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);

    console.log("🔍 Fetching bundle items...");
    const bundles = await Item.find({ type: "bundle" });

    if (bundles.length === 0) {
      console.log("No bundle items found.");
      process.exit(0);
    }

    for (const bundle of bundles) {
      let changed = false;

      bundle.itemsIncluded = bundle.itemsIncluded.map((entry) => {
        if (!entry.item) return entry;

        // If already ObjectId → nothing to do
        if (typeof entry.item !== "string") return entry;

        console.log(`➡️ Converting string ID for ${bundle.name}:`, entry.item);

        entry.item = new mongoose.Types.ObjectId(entry.item);
        changed = true;
        return entry;
      });

      if (changed) {
        await bundle.save();
        console.log(`✅ Updated bundle: ${bundle.name}`);
      } else {
        console.log(`✔️ ${bundle.name} already correct`);
      }
    }

    console.log("🎉 Done!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

run();
