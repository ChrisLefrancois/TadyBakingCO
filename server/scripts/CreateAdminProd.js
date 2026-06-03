const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Admin = require("../models/Admin");
require("dotenv").config();

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI_PROD);

  const passwordHash = await bcrypt.hash("Cookie123!", 12);

  await Admin.create({
    email: "Tadybakery17",
    passwordHash,
  });

  console.log("Admin created!");
  process.exit();
}

createAdmin();
