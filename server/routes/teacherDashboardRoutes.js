const express = require('express');
const router = express.Router();
const teacherDashboardController = require('../controllers/teacherDashboardController');

router.get('/stats', teacherDashboardController.getTeacherDashboardStats);
router.get('/:teacherId/stats', teacherDashboardController.getTeacherDashboardStats);
router.get('/today-classes', teacherDashboardController.getTodayClasses);
router.get('/:teacherId/today-classes', teacherDashboardController.getTodayClasses);

// Teacher self-registration to a course
router.get('/available-courses', teacherDashboardController.getAvailableCourses);
router.post('/register-course', teacherDashboardController.registerToCourse);

module.exports = router;

