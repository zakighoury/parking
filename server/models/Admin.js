const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin"], default: "admin" },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
});
const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
