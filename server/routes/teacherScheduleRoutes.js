const express = require('express');
const router = express.Router();
const teacherScheduleController = require('../controllers/teacherScheduleController');

router.get('/', teacherScheduleController.getTeacherSchedule);
router.get('/:teacherId', teacherScheduleController.getTeacherSchedule);

module.exports = router;
