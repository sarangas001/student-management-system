const express = require('express');
const router = express.Router();
const adminGradesController = require('../controllers/adminGradesController');

router.get('/', adminGradesController.getGradesByCourseAndAssessment);
router.put('/student/:studentId', adminGradesController.updateStudentGrade);

module.exports = router;
