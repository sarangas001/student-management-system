const express = require('express');
const router = express.Router();
const studentDashboardController = require('../controllers/studentDashboardController');
const { protect } = require('../shared/jwt/authMiddleware');

router.get('/stats', protect(['student']), studentDashboardController.getStudentDashboardStats);
router.get('/upcoming-classes', protect(['student']), studentDashboardController.getUpcomingClasses);

module.exports = router;
