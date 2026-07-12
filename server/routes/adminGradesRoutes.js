const express = require("express");

const router = express.Router();

const {
  getCourseList,
  getGradesByCourseAndAssessment,
  updateStudentGrade,
} = require("../controllers/adminGradesController");

// Get all active courses
router.get("/courses", getCourseList);

// Get grades by course and assessment
router.get("/", getGradesByCourseAndAssessment);

// Update student grade
router.put("/student/:studentId", updateStudentGrade);

module.exports = router;