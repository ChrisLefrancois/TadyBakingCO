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

      const Items = await Item.insertMany([
        {
          name: "B.B.C.C ( Brown Butter Choc Chip )",
          description: "The OG, Brown butter base + choc chips + flake salts",
          imageUrl: "https://res.cloudinary.com/hafh/image/upload/v1759796006/development/choc_cookie_transparent_rxuqol.png",
          priceSingle: 3.5,
          priceSixPack: 18,
          priceTwelvePack: 33
        },
        {
          name: "The Toffee Cookie",
          description: "Brown Butter Base + Toffee bits + flakey salt",
          imageUrl: "https://res.cloudinary.com/hafh/image/upload/v1759796089/development/toffee_cookie_transparent_hcmvjf.png",
          priceSingle: 3.5,
          priceSixPack: 18,
          priceTwelvePack: 33
        },
        {
          name: "B.B.B.T ( Brown Butter Butter Tart)",
          description: "Flaky Pastry + maple syrup + brown butter",
          imageUrl: "https://res.cloudinary.com/hafh/image/upload/v1759795824/development/butter_tart_transparent_op2swy.png",
          priceSingle: 4.25,
          priceSixPack: 24,
          priceTwelvePack: 45
        },
        {
          name: "Mini Lemon loaf",
          description: "Fresh lemon juice + buttery cake + lemon icing. Approx. 12cm x 7.5cm",
          priceSingle: 8,
          priceTwoPack: 15,
          priceFourPack: 28
        },
      ]);

      console.log('Database seeded successfully');
    } catch (error) {
      console.error('Error seeding database:', err);
    } finally {
      mongoose.connection.close();
    }
  };

  seedData();
