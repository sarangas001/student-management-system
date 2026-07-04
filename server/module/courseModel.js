const mongoose = require('mongoose');

const scheduleSlotSchema = new mongoose.Schema({
  day:       { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
  startTime: { type: String }, // e.g. "08:00"
  endTime:   { type: String }, // e.g. "10:00"
  room:      { type: String },
}, { _id: false });

const courseSchema = new mongoose.Schema({
  code:       { type: String, required: true, unique: true },
  name:       { type: String, required: true },
  teacher:    { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  credits:    { type: Number, required: true },
  status:     { type: String, enum: ['Active', 'Draft'], default: 'Active' },
  department: { type: String, required: true },
  schedule:   { type: [scheduleSlotSchema], default: [] }, // weekly timetable slots
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
