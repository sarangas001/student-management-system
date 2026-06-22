const express = require('express');
const router = express.Router();
const teacherAttendanceController = require('../controllers/teacherAttendanceController');

router.get('/courses', teacherAttendanceController.getTeacherCourses);
router.get('/roster/:courseId', teacherAttendanceController.getClassRoster);
router.post('/', teacherAttendanceController.submitAttendance);

module.exports = router;
