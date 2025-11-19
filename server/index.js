// server/index.js
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const itemRoutes = require("./routes/itemRoutes.js");
const orderRoutes = require('./routes/ordersRoutes.js');

const app = express();


// ✅ CORS setup
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://tady-baking-co.vercel.app",
      "https://tadybakingco.onrender.com",
      "https://www.tadybakingco.ca",
      "https://tadybakingco.ca"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-api-key"],
    credentials: true
  })
);

app.use(express.json());

// ✅ Routes
app.use("/api/items", itemRoutes);
app.use('/api/orders', orderRoutes);

console.log("GMAIL_USER:", process.env.GMAIL_USER || "(missing)");
console.log(
  "GMAIL_APP_PASSWORD present:",
  process.env.GMAIL_APP_PASSWORD ? "✅ yes" : "❌ no"
);

// ✅ MongoDB connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ Missing MONGO_URI in environment variables");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () =>
      console.log(`✅ Server running on port ${PORT}`)
    );
    console.log(`Connected to MongoDB`);
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
