const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  credits: { type: Number, required: true },
  status: { type: String, enum: ['Active', 'Draft'], default: 'Active' },
  department: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
