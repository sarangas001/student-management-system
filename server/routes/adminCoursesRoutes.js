const express = require('express');
const router = express.Router();
const adminCoursesController = require('../controllers/adminCoursesController');

router.get('/', adminCoursesController.getAllCourses);
router.post('/', adminCoursesController.createCourse);
router.put('/:id', adminCoursesController.updateCourse);
router.delete('/:id', adminCoursesController.deleteCourse);

module.exports = router;
