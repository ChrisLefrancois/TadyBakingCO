// server/index.js
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const itemRoutes = require("./routes/itemRoutes.js");
const orderRoutes = require("./routes/ordersRoutes.js");
const blackoutRoutes = require("./routes/blackoutRoutes.js");
const adminRoutes = require("./routes/adminAuth.js"); // <-- make sure you import this

const app = express();


// ----------------------------------------
// ✅ CORS FIX (handles OPTIONS correctly)
// ----------------------------------------
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://tady-baking-co.vercel.app",
    "https://tadybakingco.onrender.com",
    "https://www.tadybakingco.ca",
    "https://tadybakingco.ca"
  ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  allowedHeaders: "Content-Type, x-api-key, Authorization",
  credentials: true
}));

// 🔥 very important → handles preflight OPTIONS globally
app.options(/.*/, cors());


// Make sure JSON body is parsed BEFORE routes
app.use(express.json());


// ----------------------------------------
// ✅ ROUTES
// ----------------------------------------
app.use("/api/items", itemRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/blackout", blackoutRoutes);
app.use("/api/admin", adminRoutes);  // <-- REQUIRED for login to work


// Debug logs
console.log("GMAIL_USER:", process.env.GMAIL_USER || "(missing)");
console.log(
  "GMAIL_APP_PASSWORD present:",
  process.env.GMAIL_APP_PASSWORD ? "✅ yes" : "❌ no"
);


// ----------------------------------------
// ✅ MONGO CONNECTION + START SERVER
// ----------------------------------------
const PORT = process.env.PORT || 5000;

const MONGO_URI =
  process.env.NODE_ENV === "production"
    ? process.env.MONGO_URI_PROD
    : process.env.MONGO_URI_DEV;

if (!MONGO_URI) {
  console.error("❌ Missing MONGO_URI in environment variables");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () =>
      console.log(`✅ Server running on port ${PORT}`)
    );
    console.log(`Connected to MongoDB`);
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
