const express = require('express');
const router = express.Router();
const studentDashboardController = require('../controllers/studentDashboardController');

router.get('/stats', studentDashboardController.getStudentDashboardStats);
router.get('/upcoming-classes', studentDashboardController.getUpcomingClasses);

module.exports = router;
