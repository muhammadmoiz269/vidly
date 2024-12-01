const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  expired: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Token = mongoose.model("token", tokenSchema);
exports.Token = Token;
