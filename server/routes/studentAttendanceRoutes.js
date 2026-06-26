const express = require('express');
const router = express.Router();
const studentAttendanceController = require('../controllers/studentAttendanceController');
const { protect } = require('../shared/jwt/authMiddleware');

router.get('/summary', protect(['student']), studentAttendanceController.getStudentAttendanceSummary);
router.get('/details', protect(['student']), studentAttendanceController.getStudentAttendanceDetails);

module.exports = router;

