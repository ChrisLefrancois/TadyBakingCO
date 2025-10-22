const mongoose = require('mongoose');
require('dotenv').config();

const Item = require('./models/Item');

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const seedData = async () => {
  try {
    await Item.deleteMany({});

    // Insert single items first
    const singleItems = await Item.insertMany([
      {
        name: "B.B.C.C ( Brown Butter Choc Chip )",
        description: "The OG, Brown butter base + choc chips + flake salts",
        imageUrl: "https://res.cloudinary.com/hafh/image/upload/v1759796006/development/choc_cookie_transparent_rxuqol.png",
        type: "single",
        pricingTiers: [
          { quantity: 1, price: 3.25 },
          { quantity: 6, price: 18.00},
          { quantity: 12, price: 33.00 }
        ]
      },
      {
        name: "The Toffee Cookie",
        description: "Brown Butter Base + Toffee bits + flakey salt",
        imageUrl: "https://res.cloudinary.com/hafh/image/upload/v1759796089/development/toffee_cookie_transparent_hcmvjf.png",
        type: "single",
        pricingTiers: [
          { quantity: 1, price: 3.25 },
          { quantity: 6, price: 18.00},
          { quantity: 12, price: 33.00 }
        ]
      },
      {
        name: "B.B.B.T ( Brown Butter Butter Tart)",
        description: "Flaky Pastry + maple syrup + brown butter",
        imageUrl: "https://res.cloudinary.com/hafh/image/upload/v1759795824/development/butter_tart_transparent_op2swy.png",
        type: "single",
        pricingTiers: [
          { quantity: 1, price: 4.25 },
          { quantity: 6, price: 24.00},
          { quantity: 12, price: 44.00 }
        ]
      },
      {
        name: "Mini Lemon loaf",
        description: "Fresh lemon juice + buttery cake + lemon icing. Approx. 12cm x 7.5cm",
        imageUrl: "https://res.cloudinary.com/hafh/image/upload/v1760216993/lemon_loaf_kg2hnl.png",
        type: "single",
        pricingTiers: [
          { quantity: 1, price: 8.00 },
          { quantity: 2, price: 15.00},
          { quantity: 4, price: 28.00 }
        ]
      }
    ]);

    // Map the items by name for easy reference
    const itemsMap = {};
    singleItems.forEach(item => {
      itemsMap[item.name] = item;
    });

    // Insert the bundle using the _id references
    await Item.create({
      name: "Tea Time Bundle",
      description: "1x mini lemon loaf + 2x butter tarts + 4x chocolate chips + 4x toffee cookies",
      imageUrl: "https://res.cloudinary.com/hafh/image/upload/v1760229920/teatime_bundle_popup_tnfvcf.png",
      type: "bundle",
      pricingTiers: [{ quantity: 1, price: 38.00 }],
      itemsIncluded: [
        { item: itemsMap["Mini Lemon loaf"]._id, quantity: 1 },
        { item: itemsMap["B.B.B.T ( Brown Butter Butter Tart)"]._id, quantity: 2 },
        { item: itemsMap["B.B.C.C ( Brown Butter Choc Chip )"]._id, quantity: 4 },
        { item: itemsMap["The Toffee Cookie"]._id, quantity: 4 }
      ]
    });

    console.log('Database seeded successfully');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    mongoose.connection.close();
  }
};

seedData();
