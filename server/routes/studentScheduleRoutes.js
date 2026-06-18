const express = require('express');
const router = express.Router();
const studentScheduleController = require('../controllers/studentScheduleController');

router.get('/', studentScheduleController.getStudentSchedule);

module.exports = router;
