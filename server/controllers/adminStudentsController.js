const bcrypt = require('bcryptjs');
const Student = require('../module/studentModel');

const SALT_ROUNDS = 12;

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
        const { studentId, firstName, lastName, email, password, department, yearOfStudy } = req.body;

        if (!studentId || !firstName || !lastName || !email || !password || !department || !yearOfStudy) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields: studentId, firstName, lastName, email, password, department, yearOfStudy' });
        }

        const existing = await Student.findOne({ $or: [{ email }, { studentId }] });
        if (existing) {
            return res.status(409).json({ success: false, message: 'A student with this ID or email already exists' });
        }

        const hashed = await bcrypt.hash(password, SALT_ROUNDS);
        const student = await Student.create({ studentId, firstName, lastName, email, password: hashed, department, yearOfStudy });

        // Return without password
        const { password: _pw, ...studentData } = student.toObject();
        res.status(201).json({ success: true, data: studentData });
    } catch (error) {
        next(error);
    }
};

const updateStudent = async (req, res, next) => {
    try {
        // Do not allow password update through this endpoint
        const { password, ...updateData } = req.body;

        const student = await Student.findByIdAndUpdate(req.params.id, updateData, {
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
