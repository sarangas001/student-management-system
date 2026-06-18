const express = require('express');
const router = express.Router();
const teacherGradesController = require('../controllers/teacherGradesController');

router.get('/courses', teacherGradesController.getTeacherCourses);
router.get('/students/:courseId', teacherGradesController.getStudentsForGrading);
router.post('/', teacherGradesController.submitGrades);
router.put('/publish', teacherGradesController.publishGrades);

module.exports = router;
