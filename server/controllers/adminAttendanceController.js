const adminAttendanceService = require('../services/adminAttendanceService');

const getCourses = async (req, res, next) => {
    try {
        const courses = await adminAttendanceService.getCourses();
        res.status(200).json({ success: true, data: courses });
    } catch (error) {
        next(error);
    }
};

const getAttendanceSummary = async (req, res, next) => {
    try {
        const { year, month } = req.query;
        if (!year || !month) {
            return res.status(400).json({ success: false, message: 'Year and month are required' });
        }
        const summary = await adminAttendanceService.getAttendanceSummary(parseInt(year), parseInt(month));
        res.status(200).json({ success: true, data: summary });
    } catch (error) {
        next(error);
    }
};

const getStudentsByCourse = async (req, res, next) => {
    try {
        const { courseId } = req.query;
        if (!courseId) {
            return res.status(400).json({ success: false, message: 'Course ID is required' });
        }
        const students = await adminAttendanceService.getStudentsByCourse(courseId);
        res.status(200).json({ success: true, data: students });
    } catch (error) {
        next(error);
    }
};

const getAttendanceByDate = async (req, res, next) => {
    try {
        const { courseId, date } = req.query;
        if (!courseId || !date) {
            return res.status(400).json({ success: false, message: 'Course ID and date are required' });
        }
        const attendance = await adminAttendanceService.getAttendanceByDate(courseId, date);
        res.status(200).json({ success: true, data: attendance });
    } catch (error) {
        next(error);
    }
};

const saveAttendance = async (req, res, next) => {
    try {
        const { courseId, date, attendanceData } = req.body;
        if (!courseId || !date || !attendanceData || !Array.isArray(attendanceData)) {
            return res.status(400).json({ success: false, message: 'Invalid attendance data format' });
        }
        const adminId = req.user.id;
        const result = await adminAttendanceService.saveAttendance(courseId, date, attendanceData, adminId);
        res.status(200).json({ success: true, data: result, message: 'Attendance saved successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = { getCourses, getAttendanceSummary, getStudentsByCourse, getAttendanceByDate, saveAttendance };
