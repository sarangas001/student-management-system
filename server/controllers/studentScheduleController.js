const Student = require('../module/studentModel');

// ── GET /api/student/schedule ─────────────────────────────────────────────────
// Returns the enrolled courses (with teacher + schedule slots) for the
// authenticated student, identified via JWT — no query param needed.
const getStudentSchedule = async (req, res, next) => {
  try {
    const studentId = req.user.id; // MongoDB ObjectId from JWT

    const student = await Student.findById(studentId)
      .select('enrolledCourses')
      .populate({
        path: 'enrolledCourses',
        select: 'code name credits department status schedule',
        populate: {
          path: 'teacher',
          select: 'firstName lastName',
        },
      });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    return res.status(200).json({ success: true, data: student.enrolledCourses });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStudentSchedule };