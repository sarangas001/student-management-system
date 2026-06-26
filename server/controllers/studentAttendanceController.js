const Student = require('../module/studentModel');
const Attendance = require('../module/attendanceModel');
const Course = require('../module/courseModel');

const getStudentAttendanceSummary = async (req, res) => {
  try {
    const studentId = req.userId; // Mongoose ObjectId of the Student from protect middleware

    // Find the student and populate enrolled courses
    const student = await Student.findById(studentId).populate('enrolledCourses');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const summary = [];

    // For each enrolled course, aggregate the attendance
    for (const course of student.enrolledCourses) {
      const records = await Attendance.find({ student: studentId, course: course._id });
      
      const total = records.length;
      const present = records.filter(r => r.status === 'Present').length;
      const absent = records.filter(r => r.status === 'Absent').length;
      const late = records.filter(r => r.status === 'Late').length;
      const excused = records.filter(r => r.status === 'Excused').length;

      // Calculating percentage: Present + Late are counted as attended
      const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 100;

      summary.push({
        courseId: course._id,
        courseCode: course.code,
        courseName: course.name,
        total,
        present,
        absent,
        late,
        excused,
        percentage
      });
    }

    return res.status(200).json({ success: true, summary });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getStudentAttendanceDetails = async (req, res) => {
  try {
    const studentId = req.userId;
    const { courseId } = req.query; // optional course filter

    const query = { student: studentId };
    if (courseId) {
      query.course = courseId;
    }

    const records = await Attendance.find(query)
      .populate('course')
      .sort({ date: -1 });

    const details = records.map(r => ({
      id: r._id,
      courseCode: r.course ? r.course.code : 'N/A',
      courseName: r.course ? r.course.name : 'N/A',
      date: r.date,
      status: r.status
    }));

    return res.status(200).json({ success: true, details });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStudentAttendanceSummary,
  getStudentAttendanceDetails
};
