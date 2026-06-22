const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  adminId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;