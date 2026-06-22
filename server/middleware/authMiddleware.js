const jwt = require('jsonwebtoken');
const Admin = require('../module/adminModel');
const Student = require('../module/studentModel');
const Teacher = require('../module/teacherModel');

const authMiddleware = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({ success: false, message: 'Invalid token.' });
        }

        let user = null;
        let role = null;

        if (await Admin.findById(decoded.id)) {
            role = 'admin';
            user = await Admin.findById(decoded.id).select('-password');
        } else if (await Student.findById(decoded.id)) {
            role = 'student';
            user = await Student.findById(decoded.id).select('-password');
        } else if (await Teacher.findById(decoded.id)) {
            role = 'teacher';
            user = await Teacher.findById(decoded.id).select('-password');
        }

        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found.' });
        }

        req.user = user;
        req.role = role;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
};

module.exports = authMiddleware;
