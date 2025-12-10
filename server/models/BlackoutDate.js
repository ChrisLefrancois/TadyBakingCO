const mongoose = require("mongoose");

const blackoutDateSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // YYYY-MM-DD
  reason: { type: String, default: "" },
});

module.exports = mongoose.model("BlackoutDate", blackoutDateSchema);
