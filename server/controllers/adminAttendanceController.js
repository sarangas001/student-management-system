const adminAttendanceService = require('../services/adminAttendanceService');

const getCourses = async (req, res) => {
  try {
    const courses = await adminAttendanceService.getCourses();
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    console.error('Error in getCourses:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch courses' });
  }
};

const getAttendanceSummary = async (req, res) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) {
      return res.status(400).json({ success: false, message: 'Year and month are required' });
    }
    const summary = await adminAttendanceService.getAttendanceSummary(parseInt(year), parseInt(month));
    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    console.error('Error in getAttendanceSummary:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch attendance summary' });
  }
};

const getStudentsByCourse = async (req, res) => {
  try {
    const { courseId } = req.query;
    if (!courseId) {
      return res.status(400).json({ success: false, message: 'Course ID is required' });
    }
    const students = await adminAttendanceService.getStudentsByCourse(courseId);
    res.status(200).json({ success: true, data: students });
  } catch (error) {
    console.error('Error in getStudentsByCourse:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch students by course' });
  }
};

const getAttendanceByDate = async (req, res) => {
  try {
    const { courseId, date } = req.query;
    if (!courseId || !date) {
      return res.status(400).json({ success: false, message: 'Course ID and date are required' });
    }
    const attendance = await adminAttendanceService.getAttendanceByDate(courseId, date);
    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    console.error('Error in getAttendanceByDate:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch attendance by date' });
  }
};

const saveAttendance = async (req, res) => {
  try {
    const { courseId, date, attendanceData, markedBy } = req.body;
    if (!courseId || !date || !attendanceData || !Array.isArray(attendanceData)) {
      return res.status(400).json({ success: false, message: 'Invalid attendance data format' });
    }
    
    // Use markedBy from authenticated admin if available, otherwise accept markedBy from body
    const adminId = (req.user && (req.user._id || req.user.id)) || markedBy;

    const result = await adminAttendanceService.saveAttendance(courseId, date, attendanceData, adminId);
    res.status(200).json({ success: true, data: result, message: 'Attendance saved successfully' });
  } catch (error) {
    console.error('Error in saveAttendance:', error);
    res.status(500).json({ success: false, message: 'Failed to save attendance' });
  }
};

module.exports = {
  getCourses,
  getAttendanceSummary,
  getStudentsByCourse,
  getAttendanceByDate,
  saveAttendance
};
