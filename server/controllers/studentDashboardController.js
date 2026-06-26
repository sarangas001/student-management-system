const Student = require('../module/studentModel');
const Attendance = require('../module/attendanceModel');
const Grade = require('../module/gradeModel');
const Course = require('../module/courseModel');

// Grade letter -> GPA point mapping
const gradeToGPA = { 'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D': 1.0, 'F': 0.0 };

const getStudentDashboardStats = async (req, res) => {
  try {
    const studentId = req.userId;

    // Fetch student with enrolled courses populated (with teacher)
    const student = await Student.findById(studentId).populate({
      path: 'enrolledCourses',
      populate: { path: 'teacher', model: 'Teacher', select: 'firstName lastName' }
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const enrolledCourses = student.enrolledCourses;

    // --- Attendance stats ---
    let totalAttended = 0, totalSessions = 0;
    const courseAttendanceMap = {};

    for (const course of enrolledCourses) {
      const records = await Attendance.find({ student: studentId, course: course._id });
      const total = records.length;
      const attended = records.filter(r => r.status === 'Present' || r.status === 'Late').length;
      totalSessions += total;
      totalAttended += attended;
      const pct = total > 0 ? Math.round((attended / total) * 100) : 100;
      courseAttendanceMap[course._id.toString()] = pct;
    }

    const overallAttendance = totalSessions > 0
      ? Math.round((totalAttended / totalSessions) * 100)
      : 100;

    // --- GPA from published grades ---
    const grades = await Grade.find({ student: studentId, published: true });
    let gpa = null;
    if (grades.length > 0) {
      const totalPoints = grades.reduce((sum, g) => sum + (gradeToGPA[g.grade] ?? 0), 0);
      gpa = parseFloat((totalPoints / grades.length).toFixed(2));
    }

    // --- Build course list with status ---
    const atRiskThreshold = 75;
    let atRiskCount = 0;

    const courseList = enrolledCourses.map(course => {
      const attendancePct = courseAttendanceMap[course._id.toString()] ?? 100;
      const isAtRisk = attendancePct < atRiskThreshold;
      if (isAtRisk) atRiskCount++;
      const teacherName = course.teacher
        ? `${course.teacher.firstName} ${course.teacher.lastName}`
        : 'N/A';

      return {
        courseId: course._id,
        code: course.code,
        name: course.name,
        teacher: teacherName,
        attendance: attendancePct,
        status: isAtRisk ? 'At Risk' : 'On Track'
      };
    });

    // --- Announcements: dynamic low-attendance warnings ---
    const announcements = courseList
      .filter(c => c.status === 'At Risk')
      .map(c => ({
        type: 'warning',
        message: `${c.code} attendance is at ${c.attendance}%. Attend regularly to avoid penalty.`
      }));

    return res.status(200).json({
      success: true,
      stats: {
        enrolledCount: enrolledCourses.length,
        overallAttendance,
        gpa,
        atRiskCount
      },
      courses: courseList,
      announcements
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Static weekly schedule per course code (no schedule model exists)
const COURSE_SCHEDULE = {
  CS301: [{ day: 'Monday',    time: '08:00 AM', venue: 'Lab A-101' },
          { day: 'Wednesday', time: '10:00 AM', venue: 'Lab A-101' }],
  CS302: [{ day: 'Tuesday',   time: '09:00 AM', venue: 'Room B-202' },
          { day: 'Thursday',  time: '11:00 AM', venue: 'Room B-202' }],
  MA201: [{ day: 'Monday',    time: '11:00 AM', venue: 'Hall C-301' },
          { day: 'Friday',    time: '09:00 AM', venue: 'Hall C-301' }],
  EN102: [{ day: 'Wednesday', time: '01:00 PM', venue: 'Room D-105' },
          { day: 'Friday',    time: '03:00 PM', venue: 'Room D-105' }],
};

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const getRelativeDayLabel = (dayName, currentDayIndex) => {
  const dayIndex = DAY_ORDER.indexOf(dayName);
  if (dayIndex === currentDayIndex) return 'Today';
  if (dayIndex === (currentDayIndex + 1) % 7) return 'Tomorrow';
  return dayName;
};

const getTimeOrder = (time) => {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return Number.MAX_SAFE_INTEGER;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3].toUpperCase();

  if (period === 'AM') {
    hour = hour === 12 ? 0 : hour;
  } else if (hour !== 12) {
    hour += 12;
  }

  return hour * 60 + minute;
};

const getUpcomingClasses = async (req, res) => {
  try {
    const studentId = req.userId;

    const student = await Student.findById(studentId).populate('enrolledCourses');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const today = new Date();
    const todayDayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()];
    const todayIndex = DAY_ORDER.indexOf(todayDayName);

    const upcoming = [];
    for (const course of student.enrolledCourses) {
      const schedule = COURSE_SCHEDULE[course.code];
      if (!schedule) continue;
      for (const slot of schedule) {
        const dayIndex = DAY_ORDER.indexOf(slot.day);
        const relativeOffset = (dayIndex - todayIndex + 7) % 7;
        if (relativeOffset > 1) continue;

        upcoming.push({
          courseCode: course.code,
          courseName: course.name,
          day: slot.day,
          dayLabel: getRelativeDayLabel(slot.day, todayIndex),
          time: slot.time,
          venue: slot.venue,
          dayIndex,
          timeOrder: getTimeOrder(slot.time),
          relativeOffset
        });
      }
    }

    // Sort: today's classes first, then tomorrow's classes, then by time.
    upcoming.sort((a, b) => {
      if (a.relativeOffset !== b.relativeOffset) {
        return a.relativeOffset - b.relativeOffset;
      }

      return a.timeOrder - b.timeOrder;
    });

    return res.status(200).json({ success: true, upcoming });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
module.exports = {
  getStudentDashboardStats,
  getUpcomingClasses
};
