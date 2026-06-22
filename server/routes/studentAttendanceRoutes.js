const express = require('express');
const router = express.Router();
const studentAttendanceController = require('../controllers/studentAttendanceController');

router.get('/summary', studentAttendanceController.getStudentAttendanceSummary);
router.get('/details', studentAttendanceController.getStudentAttendanceDetails);

module.exports = router;
