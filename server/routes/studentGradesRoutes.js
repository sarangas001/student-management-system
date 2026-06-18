const express = require('express');
const router = express.Router();
const studentGradesController = require('../controllers/studentGradesController');

router.get('/', studentGradesController.getStudentGrades);
router.get('/cgpa', studentGradesController.getStudentCGPA);

module.exports = router;
