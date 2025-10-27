// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const itemRoutes = require('./routes/itemRoutes.js');
const orderRoutes = ('./routes/ordersRoutes.js');

dotenv.config();

const app = express();
app.use(cors({
  origin: ["http://localhost:5173", "https://tady-baking-co.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/items', itemRoutes);
// app.use('/api/orders', orderRoutes);

// MongoDB Connection
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch((err) => console.error(err));
