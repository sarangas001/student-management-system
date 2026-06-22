const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  assessmentType: { type: String, enum: ['Mid Exam', 'Final Exam', 'Assignment', 'Quiz'], required: true },
  marks: { type: Number, required: true },
  grade: { type: String, required: true },
  remark: { type: String },
  published: { type: Boolean, default: false }
}, { timestamps: true });

const Grade = mongoose.model('Grade', gradeSchema);
module.exports = Grade;
