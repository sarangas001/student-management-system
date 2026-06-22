const bcrypt = require('bcrypt');
const Admin = require('../module/adminModel');
const Student = require('../module/studentModel');
const Teacher = require('../module/teacherModel');
const jwt = require('jsonwebtoken');
const jwtService = require('../shared/jwt/jwt.service');

const register = async (req, res) => {
    try {

        const {role} = req.body;

        if (role == 'admin') {
            const {adminId, firstName, lastName, email, password} = req.body;

            if (!adminId || !firstName || !lastName || !email || !password) {
                return res.json({success: false, message: 'Please provide all required fields'});
            }

            const existingAdmin = await Admin.findOne({email});

            if (existingAdmin) {
                return res.json({success: false, message: 'Admin already exists'});
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newAdmin = new Admin({adminId, firstName, lastName, email, password: hashedPassword});

            console.log('New Admin:', newAdmin);

            const savedAdmin = await newAdmin.save();

            const token = jwtService.generateToken(savedAdmin._id);

            jwtService.saveToken({res, token});
        
        } else if (role == 'student') {
            const {studentId, firstName, lastName, email, password, department, yearOfStudy} = req.body;

            if (!studentId || !firstName || !lastName || !email || !password || !department || !yearOfStudy) {
                return res.json({success: false, message: 'Please provide all required fields'});
            }

            const existingStudent = await Student.findOne({email});

            if (existingStudent) {
                return res.json({success: false, message: 'Student already exists'});
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newStudent = new Student({studentId, firstName, lastName, email, password: hashedPassword, department, yearOfStudy});

            const savedStudent = await newStudent.save();

            const token = jwtService.generateToken(savedStudent._id);

            jwtService.saveToken({res, token});
        } else if (role == 'teacher') {

            const {teacherId, firstName, lastName, email, password, department} = req.body;

            if (!teacherId || !firstName || !lastName || !email || !password || !department) {
                return res.json({success: false, message: 'Please provide all required fields'});
            }

            const existingTeacher = await Teacher.findOne({email});

            if (existingTeacher) {
                return res.json({success: false, message: 'Teacher already exists'});
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newTeacher = new Teacher({teacherId, firstName, lastName, email, password: hashedPassword, department});

            const savedTeacher = await newTeacher.save();

            const token = jwtService.generateToken(savedTeacher._id);

            jwtService.saveToken({res, token});
        }else {
            return res.json({success: false, message: 'Invalid role'});
        }

        return res.json({success: true, message: 'User registered successfully'});

    }catch (error) {
        return res.json({success: false, message: error.message});
    }
}

const login = async (req, res) => {
    try {
        const {email, password} = req.body;
        const admin =await Teacher.findOne({email: email})

        const role = await Admin.findOne({email}) ? 'admin' : await  Student.findOne({email}) ? 'student' : await Teacher.findOne({email}) ? 'teacher' : null;

        if (!email || !password || !role) {
            return res.json({success: false, message: 'Please provide all required fields'});
        }

        if (role == 'admin') {
            const admin = await Admin.findOne({email});

            if (!admin) {
                return res.json({success: false, message: 'Admin not found'});
            }

            const isPasswordValid = await bcrypt.compare(password, admin.password);

            if (!isPasswordValid) {
                return res.json({success: false, message: 'Invalid password'});
            }

            const token = jwtService.generateToken(admin._id);
            jwtService.saveToken({res, token});

        } else if (role == 'student') {
            const student = await Student.findOne({email});
            if (!student) {
                return res.json({success: false, message: 'Student not found'});
            }
            const isPasswordValid = await bcrypt.compare(password, student.password);
            if (!isPasswordValid) {
                return res.json({success: false, message: 'Invalid password'});
            }
            const token = jwtService.generateToken(student._id);
            jwtService.saveToken({res, token});
        } else if (role == 'teacher') {
            const teacher = await Teacher.findOne({email});
            if (!teacher) {
                return res.json({success: false, message: 'Teacher not found'});
            }
            const isPasswordValid = await bcrypt.compare(password, teacher.password);
            if (!isPasswordValid) {
                return res.json({success: false, message: 'Invalid password'});
            }
            const token = jwtService.generateToken(teacher._id);
            jwtService.saveToken({res, token});
        }

        return res.json({success: true, message: 'User logged in successfully'});

    }catch (error) {
        return res.json({success: false, message: error.message});
    }
}

const logout = async (req, res) => {
    try {
        jwtService.clearToken(res);
        return res.json({success: true, message: 'User logged out successfully'});
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

module.exports = {
    register,
    login,
    logout
}