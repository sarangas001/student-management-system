const express = require('express');
const router = express.Router();
const adminStudentsController = require('../controllers/adminStudentsController');

router.get('/', adminStudentsController.getAllStudents);
router.get('/:id', adminStudentsController.getStudentById);
router.post('/', adminStudentsController.createStudent);
router.put('/:id', adminStudentsController.updateStudent);
router.delete('/:id', adminStudentsController.deleteStudent);

module.exports = router;
