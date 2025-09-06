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
          priceSingle: 3.5,
          priceSixPack: 18,
          priceTwelvePack: 33
        },
        {
          name: "The Toffee Cookie",
          description: "Brown Butter Base + Toffee bits + flakey salt",
          priceSingle: 3.5,
          priceSixPack: 18,
          priceTwelvePack: 33
        },
        {
          name: "B.B.B.T ( Brown Butter Butter Tart)",
          description: "Flaky Pastry + maple syrup + brown butter",
          priceSingle: 4.25,
          priceSixPack: 24,
          priceTwelvePack: 45
        },
        {
          name: "Date Blondies",
          description: "Brown Butter Base + Toffee bits + flakey salt",
          priceSingle: 4.25,
          priceSixPack: 24,
          priceTwelvePack: 45
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
