const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Admin = require("../models/Admin");
require("dotenv").config();

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  const passwordHash = await bcrypt.hash("yourpassword123", 12);

  await Admin.create({
    email: "your@email.com",
    passwordHash,
  });

  console.log("Admin created!");
  process.exit();
}

createAdmin();
