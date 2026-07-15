const express = require('express');
const router = express.Router();
const studentDashboardController = require('../controllers/studentDashboardController');

router.get('/stats', studentDashboardController.getStudentDashboardStats);
router.get('/upcoming-classes', studentDashboardController.getUpcomingClasses);
router.get('/available-courses', studentDashboardController.getAvailableCourses);
router.post('/enroll-course', studentDashboardController.enrollInCourse);

module.exports = router;

