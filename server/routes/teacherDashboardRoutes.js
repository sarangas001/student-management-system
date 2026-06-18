const express = require('express');
const router = express.Router();
const teacherDashboardController = require('../controllers/teacherDashboardController');

router.get('/stats', teacherDashboardController.getTeacherDashboardStats);
router.get('/today-classes', teacherDashboardController.getTodayClasses);

module.exports = router;
