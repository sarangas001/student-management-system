const Course = require('../module/courseModel');
const Student = require('../module/studentModel');
const Attendance = require('../module/attendanceModel');

const getCourses = async () => {
  return await Course.find({ status: 'Active' })
    .select('_id code name credits status department');
};

const getAttendanceSummary = async (year, month) => {
  if (!year || !month || year < 2000 || month < 1 || month > 12) {
    throw new Error('Invalid year or month');
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const attendances = await Attendance.find({
    date: { $gte: startDate, $lte: endDate }
  });

  const summary = {
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    attendanceByDay: {}
  };

  const statusMap = {
    'Present': 'P',
    'Absent': 'A',
    'Late': 'L',
    'Excused': 'E'
  };

  attendances.forEach(record => {
    const day = new Date(record.date).getDate();
    const statusKey = record.status.toLowerCase(); // 'present', 'absent', etc
    
    if (summary[statusKey] !== undefined) {
      summary[statusKey]++;
    }

    // This assigns the status of the first found record for the day.
    // Given the prompt, we just need to provide it mapped by day number.
    if (!summary.attendanceByDay[day]) {
      summary.attendanceByDay[day] = statusMap[record.status] || 'P';
    } else {
      // Overwrite logic if needed: if we find Absent, prioritize showing Absent for the day
      if (statusMap[record.status] === 'A') {
        summary.attendanceByDay[day] = 'A';
      }
    }
  });

  return summary;
};

const getStudentsByCourse = async (courseId) => {
  return await Student.find({ enrolledCourses: courseId })
    .select('_id studentId firstName lastName email department yearOfStudy');
};

const getAttendanceByDate = async (courseId, date) => {
  const queryDate = new Date(date);
  const startOfDay = new Date(queryDate.setUTCHours(0, 0, 0, 0));
  const endOfDay = new Date(queryDate.setUTCHours(23, 59, 59, 999));

  return await Attendance.find({
    course: courseId,
    date: { $gte: startOfDay, $lte: endOfDay }
  }).populate('student', 'firstName lastName studentId email');
};

const saveAttendance = async (courseId, date, attendanceData, markedBy) => {
  const attendanceDate = new Date(date);
  attendanceDate.setUTCHours(0, 0, 0, 0);

  const operations = attendanceData.map(record => ({
    updateOne: {
      filter: {
        course: courseId,
        student: record.studentId, // As per prompt
        date: {
          $gte: attendanceDate,
          $lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000)
        }
      },
      update: {
        $set: {
          course: courseId,
          student: record.studentId,
          date: attendanceDate,
          status: record.status,
          markedBy: markedBy || record.markedBy || record.studentId, // Dummy if not provided
          markerModel: 'Admin'
        }
      },
      upsert: true
    }
  }));

  if (operations.length > 0) {
    return await Attendance.bulkWrite(operations);
  }
  return { message: "No attendance data provided" };
};

module.exports = {
  getCourses,
  getAttendanceSummary,
  getStudentsByCourse,
  getAttendanceByDate,
  saveAttendance
};
