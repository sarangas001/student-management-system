const Student = require('../module/studentModel');
const Attendance = require('../module/attendanceModel');
const Grade = require('../module/gradeModel');
const Course = require('../module/courseModel');

/**
 * Get dashboard statistics for a student.
 * Returns: {
 *   enrolledCount,
 *   avgAttendance (percentage),
 *   gpa,
 *   atRiskCount,
 *   courses: [{ _id, name, code }]
 * }
 */
const getStudentDashboardStats = async (req, res) => {
  try {
    const studentId = req.params.studentId || (req.user && req.user.id);
    if (!studentId) return res.status(400).json({ error: 'Student ID missing' });

    const student = await Student.findById(studentId).populate('enrolledCourses', 'name code');
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const enrolledCount = student.enrolledCourses.length;

    // Attendance statistics
    const attendances = await Attendance.find({ student: studentId });
    const totalSessions = attendances.length;
    const presentCount = attendances.filter(a => a.status === 'Present').length;
    const avgAttendance = totalSessions ? ((presentCount / totalSessions) * 100).toFixed(2) : 0;

    // GPA calculation (simple average of points)
    const grades = await Grade.find({ student: studentId });
    const totalPoints = grades.reduce((sum, g) => sum + g.points, 0);
    const gpa = grades.length ? (totalPoints / grades.length).toFixed(2) : 0;

    // At‑risk courses: low points (< 2) or attendance < 75%
    const atRiskByGrade = grades.filter(g => g.points < 2).length;
    const atRiskByAttendance = attendances.filter(a => a.status !== 'Present').length > 0 ? 1 : 0; // simplistic
    const atRiskCount = atRiskByGrade + atRiskByAttendance;

    res.json({
      enrolledCount,
      avgAttendance,
      gpa,
      atRiskCount,
      courses: student.enrolledCourses.map(c => ({ _id: c._id, name: c.name, code: c.code })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Very lightweight mock of upcoming classes.
 * In a real system this would come from a Schedule model.
 */
const weeklySchedule = {
  // day: 0 = Sunday, 1 = Monday, ... 6 = Saturday
  // Example static mapping – extend as needed.
  CS101: [{ day: 1, time: '10:00', location: 'Room A' }],
  MATH201: [{ day: 3, time: '14:00', location: 'Room B' }],
  HIST301: [{ day: 5, time: '09:30', location: 'Room C' }],
};

const getUpcomingClasses = async (req, res) => {
  try {
    const studentId = req.params.studentId || (req.user && req.user.id);
    if (!studentId) return res.status(400).json({ error: 'Student ID missing' });

    const student = await Student.findById(studentId).populate('enrolledCourses', 'code name');
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const now = new Date();
    let upcoming = [];

    student.enrolledCourses.forEach(course => {
      const schedule = weeklySchedule[course.code] || [];
      schedule.forEach(s => {
        // Compute the next occurrence of the given day/time
        const dayDiff = (s.day + 7 - now.getDay()) % 7;
        const next = new Date(now);
        next.setDate(now.getDate() + dayDiff);
        const [hour, minute] = s.time.split(':').map(Number);
        next.setHours(hour, minute, 0, 0);
        if (next >= now) {
          upcoming.push({
            courseCode: course.code,
            title: course.name,
            dateTime: next,
            location: s.location,
          });
        }
      });
    });

    upcoming.sort((a, b) => a.dateTime - b.dateTime);
    // Return next 5 sessions only
    upcoming = upcoming.slice(0, 5);
    res.json(upcoming);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getStudentDashboardStats,
  getUpcomingClasses,
};
