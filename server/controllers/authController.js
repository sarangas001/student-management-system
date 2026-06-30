const bcrypt = require('bcryptjs');
const Admin   = require('../module/adminModel');
const Student = require('../module/studentModel');
const Teacher = require('../module/teacherModel');
const jwtService = require('../shared/jwt/jwt.service');
const logger  = require('../utils/logger');

const SALT_ROUNDS = 12;

// ── Register ──────────────────────────────────────────────────────────────────
const register = async (req, res, next) => {
    try {
        const { role } = req.body;

        if (role === 'admin') {
            const { adminId, firstName, lastName, email, password } = req.body;

            if (!adminId || !firstName || !lastName || !email || !password) {
                return res.status(400).json({ success: false, message: 'Please provide all required fields' });
            }

            const existing = await Admin.findOne({ $or: [{ email }, { adminId }] });
            if (existing) {
                return res.status(409).json({ success: false, message: 'Admin already exists' });
            }

            const hashed = await bcrypt.hash(password, SALT_ROUNDS);
            const saved  = await new Admin({ adminId, firstName, lastName, email, password: hashed }).save();
            const token  = jwtService.generateToken(saved._id, 'admin');
            jwtService.saveToken({ res, token });

        } else if (role === 'student') {
            const { studentId, firstName, lastName, email, password, department, yearOfStudy } = req.body;

            if (!studentId || !firstName || !lastName || !email || !password || !department || !yearOfStudy) {
                return res.status(400).json({ success: false, message: 'Please provide all required fields' });
            }

            const existing = await Student.findOne({ $or: [{ email }, { studentId }] });
            if (existing) {
                return res.status(409).json({ success: false, message: 'Student already exists' });
            }

            const hashed = await bcrypt.hash(password, SALT_ROUNDS);
            const saved  = await new Student({ studentId, firstName, lastName, email, password: hashed, department, yearOfStudy }).save();
            const token  = jwtService.generateToken(saved._id, 'student');
            jwtService.saveToken({ res, token });

        } else if (role === 'teacher') {
            const { teacherId, firstName, lastName, email, password, department } = req.body;

            if (!teacherId || !firstName || !lastName || !email || !password || !department) {
                return res.status(400).json({ success: false, message: 'Please provide all required fields' });
            }

            const existing = await Teacher.findOne({ $or: [{ email }, { teacherId }] });
            if (existing) {
                return res.status(409).json({ success: false, message: 'Teacher already exists' });
            }

            const hashed = await bcrypt.hash(password, SALT_ROUNDS);
            const saved  = await new Teacher({ teacherId, firstName, lastName, email, password: hashed, department }).save();
            const token  = jwtService.generateToken(saved._id, 'teacher');
            jwtService.saveToken({ res, token });

        } else {
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }

        return res.status(201).json({ success: true, message: 'User registered successfully' });

    } catch (error) {
        next(error);
    }
};

// ── Login ─────────────────────────────────────────────────────────────────────
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        // Query all collections in parallel — single round-trip per collection
        const [admin, student, teacher] = await Promise.all([
            Admin.findOne({ email }).select('+password'),
            Student.findOne({ email }).select('+password'),
            Teacher.findOne({ email }).select('+password'),
        ]);

        const user = admin || student || teacher;
        if (!user) {
            // Generic message prevents user-enumeration
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const role = admin ? 'admin' : student ? 'student' : 'teacher';

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwtService.generateToken(user._id, role);
        jwtService.saveToken({ res, token });

        logger.info(`User logged in: ${email} as ${role}`);

        return res.status(200).json({ success: true, message: 'Logged in successfully', role });

    } catch (error) {
        next(error);
    }
};

// ── Logout ────────────────────────────────────────────────────────────────────
const logout = async (req, res, next) => {
    try {
        jwtService.clearToken(res);
        return res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
};

// ── isLoggedIn ────────────────────────────────────────────────────────────────
const isLoggedIn = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return res.status(200).json({ success: false, message: 'Not authenticated' });
        }

        const decoded = jwtService.decodeToken(token);
        if (!decoded) {
            return res.status(200).json({ success: false, message: 'Invalid token' });
        }

        // Fetch user and explicitly exclude password from response
        let user = null;
        let role = null;

        const [admin, student, teacher] = await Promise.all([
            Admin.findById(decoded.id).select('-password'),
            Student.findById(decoded.id).select('-password'),
            Teacher.findById(decoded.id).select('-password'),
        ]);

        if (admin)        { user = admin;   role = 'admin'; }
        else if (student) { user = student; role = 'student'; }
        else if (teacher) { user = teacher; role = 'teacher'; }

        if (!user) {
            return res.status(200).json({ success: false, message: 'User not found' });
        }

        return res.status(200).json({ success: true, message: 'Authenticated', role, user });

    } catch (error) {
        next(error);
    }
};

module.exports = { register, login, logout, isLoggedIn };
