const mongoose = require("mongoose");
require("dotenv").config();

const Item = require("./models/Item");
const Order = require("./models/Order");

mongoose
  .connect(process.env.MONGO_URI_PROD)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));



const seedData = async () => {
  try {
    await Item.deleteMany({});
    await Order.deleteMany({});

    // ----------------------------
    // INSERT SINGLE ITEMS
    // ----------------------------
    const singleItems = await Item.insertMany([
      {
        type: "single",
        slug: "brown-butter-choc-chip",
        name: "B.B.C.C ( Brown Butter Choc Chip )",
        category: "cookie",
        description: "The OG, Brown butter base + choc chips + flake salts",
        imageUrl:
          "https://res.cloudinary.com/hafh/image/upload/v1759796006/development/choc_cookie_transparent_rxuqol.png",
        pricingTiers: [
          { quantity: 1, price: 3.25 },
          { quantity: 6, price: 18.0 },
          { quantity: 12, price: 33.0 },
        ],
      },
      {
        type: "single",
        slug: "toffee-cookie",
        name: "The Toffee Cookie",
        category: "cookie",
        description: "Brown Butter Base + Toffee bits + flakey salt",
        imageUrl:
          "https://res.cloudinary.com/hafh/image/upload/v1759796089/development/toffee_cookie_transparent_hcmvjf.png",
        pricingTiers: [
          { quantity: 1, price: 3.25 },
          { quantity: 6, price: 18.0 },
          { quantity: 12, price: 33.0 },
        ],
      },
      {
        type: "single",
        slug: "brown-butter-tart",
        name: "B.B.B.T ( Brown Butter Butter Tart)",
        category: "tart",
        description: "Flaky Pastry + maple syrup + brown butter",
        imageUrl:
          "https://res.cloudinary.com/hafh/image/upload/v1759795824/development/butter_tart_transparent_op2swy.png",
        pricingTiers: [
          { quantity: 1, price: 4.25 },
          { quantity: 6, price: 24.0 },
          { quantity: 12, price: 44.0 },
        ],
      },
      {
        type: "single",
        slug: "lemon-loaf",
        name: "Mini Lemon loaf",
        category: "loaf",
        description:
          "Fresh lemon juice + buttery cake + lemon icing. Approx. 12cm x 7.5cm",
        imageUrl:
          "https://res.cloudinary.com/hafh/image/upload/v1760216993/lemon_loaf_kg2hnl.png",
        pricingTiers: [
          { quantity: 1, price: 8.0 },
          { quantity: 2, price: 15.0 },
          { quantity: 4, price: 28.0 },
        ],
      },
    ]);

    // ----------------------------
    // MAP ITEMS BY SLUG
    // ----------------------------
    const itemsMap = {};
    singleItems.forEach((item) => {
      itemsMap[item.slug] = item;
    });

    // ----------------------------
    // CREATE THE BUNDLE
    // ----------------------------
    await Item.create({
      type: "bundle",
      slug: "tea-time-bundle",
      name: "Tea Time Bundle",
      category: "bundle",
      description:
        "1x mini lemon loaf + 2x butter tarts + 4x choc chips + 4x toffee cookies",
      imageUrl:
        "https://res.cloudinary.com/hafh/image/upload/v1760229920/teatime_bundle_popup_tnfvcf.png",

      bundlePrice: 38.0,
      bundleSave: 4.0,

      itemsIncluded: [
        { item: itemsMap["lemon-loaf"]._id, quantity: 1 },
        { item: itemsMap["brown-butter-tart"]._id, quantity: 2 },
        { item: itemsMap["brown-butter-choc-chip"]._id, quantity: 4 },
        { item: itemsMap["toffee-cookie"]._id, quantity: 4 },
      ],
    });

    console.log("Database seeded successfully 🎉");
  } catch (err) {
    console.error("❌ Error seeding database:", err);
  } finally {
    mongoose.connection.close();
  }
};

seedData();
