const express = require('express');
const router = express.Router();
const adminDashboardController = require('../controllers/adminDashboardController');

router.get('/stats', adminDashboardController.getDashboardStats);
router.get('/recent-activities', adminDashboardController.getRecentActivities);
router.get('/attendance-by-course', adminDashboardController.getAttendanceByCourse);

module.exports = router;
