const express = require('express');
const router = express.Router();
const adminAttendanceController = require('../controllers/adminAttendanceController');

router.get('/courses', adminAttendanceController.getCourses);
router.get('/summary', adminAttendanceController.getAttendanceSummary);
router.get('/students', adminAttendanceController.getStudentsByCourse);
router.get('/', adminAttendanceController.getAttendanceByDate);
router.post('/', adminAttendanceController.saveAttendance);

module.exports = router;
