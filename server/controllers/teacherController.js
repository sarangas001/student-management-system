const Teacher = require('../module/teacherModel');

// get all teachers
const getTeachers = async (_req, res) => {
  try {
    const teachers = await Teacher.find().select('-password');
    res.status(200).json({ success: true, count: teachers.length, data: teachers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// get teacher by id
const getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).select('-password');
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    res.status(200).json({ success: true, data: teacher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// create teacher
const createTeacher = async (_req, _res) => {

};

// update teacher
const updateTeacher = async (_req, _res) => {

};

// delete teacher
const deleteTeacher = async (_req, _res) => {

};

module.exports = {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher
};
