const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    assessmentType: {
      type: String,
      enum: [
        "Mid Exam",
        "Final Exam",
        "Assignment",
        "Quiz",
      ],
      required: true,
    },

    marks: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    grade: {
      type: String,
      default: "F",
    },

    remark: {
      type: String,
      default: "Not Graded",
    },

    published: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

gradeSchema.index({
  student: 1,
  course: 1,
  assessmentType: 1,
}, {
  unique: true,
});

module.exports = mongoose.model("Grade", gradeSchema);