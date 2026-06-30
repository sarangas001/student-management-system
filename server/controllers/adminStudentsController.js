const Student = require('../module/studentModel');

const getAllStudents = async (req, res, next) => {
    try {
        const students = await Student.find().select('-password');
        res.status(200).json({ success: true, count: students.length, data: students });
    } catch (error) {
        next(error);
    }
};

const getStudentById = async (req, res, next) => {
    try {
        const student = await Student.findById(req.params.id).select('-password');
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        res.status(200).json({ success: true, data: student });
    } catch (error) {
        next(error);
    }
};

const createStudent = async (req, res, next) => {
    try {
        const student = await Student.create(req.body);
        res.status(201).json({ success: true, data: student });
    } catch (error) {
        next(error);
    }
};

const updateStudent = async (req, res, next) => {
    try {
        const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }).select('-password');
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        res.status(200).json({ success: true, data: student });
    } catch (error) {
        next(error);
    }
};

const deleteStudent = async (req, res, next) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        res.status(200).json({ success: true, message: 'Student deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllStudents, getStudentById, createStudent, updateStudent, deleteStudent };
