const Teacher = require('../module/teacherModel');
const Course = require('../module/courseModel');
const Student = require('../module/studentModel');
const Grade = require('../module/gradeModel');
const Attendance = require('../module/attendanceModel');

const getTeacherIdentifier = (req) => {
  return req.query.teacherId || req.params.teacherId || req.body?.teacherId;
};

const getTodayDateRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const getTeacherContext = async (teacherId) => {
  const teacher = await Teacher.findOne({ teacherId }).lean();

  if (!teacher) {
    return null;
  }

  const assignedCourses = await Course.find({
    $or: [
      { teacher: teacher._id },
      { _id: { $in: teacher.assignedCourses || [] } },
    ],
  })
    .select('_id code name credits department status')
    .lean();

  const courseIds = assignedCourses.map((course) => course._id);

  return { teacher: { ...teacher, assignedCourses }, courseIds };
};

const getCourseStudentCounts = async (courseIds) => {
  if (!courseIds.length) {
    return new Map();
  }

  const counts = await Student.aggregate([
    {
      $match: {
        enrolledCourses: { $in: courseIds },
      },
    },
    {
      $unwind: '$enrolledCourses',
    },
    {
      $match: {
        enrolledCourses: { $in: courseIds },
      },
    },
    {
      $group: {
        _id: '$enrolledCourses',
        count: { $sum: 1 },
      },
    },
  ]);

  return new Map(counts.map((entry) => [String(entry._id), entry.count]));
};

const getTodayClassCourses = async (courseIds, fallbackCourses) => {
  if (!courseIds.length) {
    return [];
  }

  const { start, end } = getTodayDateRange();
  const todayCourseIds = await Attendance.distinct('course', {
    course: { $in: courseIds },
    date: { $gte: start, $lte: end },
  });

  const selectedCourseIds = todayCourseIds.length > 0 ? todayCourseIds : courseIds;
  const selectedCourseIdSet = new Set(selectedCourseIds.map((id) => String(id)));

  const courseDocs = (fallbackCourses || []).filter((course) =>
    selectedCourseIdSet.has(String(course._id))
  );

  if (courseDocs.length > 0) {
    return courseDocs;
  }

  return Course.find({
    _id: { $in: selectedCourseIds },
    status: 'Active',
  })
    .select('_id code name credits department status')
    .lean();
};

const ATTENDANCE_WARNING_THRESHOLD = 75;

const getAttendanceAlerts = async (courseIds) => {
  if (!courseIds.length) {
    return [];
  }

  const summaries = await Attendance.aggregate([
    { $match: { course: { $in: courseIds } } },
    {
      $group: {
        _id: { student: '$student', course: '$course' },
        total: { $sum: 1 },
        present: {
          $sum: { $cond: [{ $in: ['$status', ['Present', 'Late']] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        student: '$_id.student',
        course: '$_id.course',
        percentage: { $multiply: [{ $divide: ['$present', '$total'] }, 100] },
      },
    },
    { $match: { percentage: { $lt: ATTENDANCE_WARNING_THRESHOLD } } },
    {
      $lookup: {
        from: 'students',
        localField: 'student',
        foreignField: '_id',
        as: 'studentDoc',
      },
    },
    { $unwind: '$studentDoc' },
    {
      $lookup: {
        from: 'courses',
        localField: 'course',
        foreignField: '_id',
        as: 'courseDoc',
      },
    },
    { $unwind: '$courseDoc' },
    {
      $project: {
        _id: 0,
        studentId: '$studentDoc.studentId',
        studentName: { $concat: ['$studentDoc.firstName', ' ', '$studentDoc.lastName'] },
        courseCode: '$courseDoc.code',
        percentage: { $round: ['$percentage', 0] },
      },
    },
    { $sort: { percentage: 1 } },
  ]);

  return summaries;
};

const buildTeacherDashboard = async (teacherId) => {
  const context = await getTeacherContext(teacherId);

  if (!context) {
    return null;
  }

  const { teacher, courseIds } = context;
  const activeCourses = (teacher.assignedCourses || []).filter(
    (course) => !course.status || course.status === 'Active'
  );

  const [uniqueStudentIds, pendingGrades, courseStudentCounts, todayClassCourses, attendanceAlerts] =
    await Promise.all([
      courseIds.length
        ? Student.distinct('_id', { enrolledCourses: { $in: courseIds } })
        : Promise.resolve([]),
      courseIds.length
        ? Grade.countDocuments({ course: { $in: courseIds }, published: false })
        : Promise.resolve(0),
      getCourseStudentCounts(courseIds),
      getTodayClassCourses(courseIds, activeCourses),
      getAttendanceAlerts(courseIds),
    ]);

  const todayClasses = todayClassCourses.map((course) => ({
    id: course._id,
    code: course.code,
    name: course.name,
    department: course.department,
    credits: course.credits,
    studentCount: courseStudentCounts.get(String(course._id)) || 0,
    status: course.status || 'Active',
  }));

  return {
    teacher: {
      teacherId: teacher.teacherId,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
      department: teacher.department,
    },
    stats: {
      myStudents: uniqueStudentIds.length,
      myCourses: activeCourses.length,
      todayClasses: todayClasses.length,
      pendingGrades,
    },
    todayClasses,
    attendanceAlerts,
  };
};

const getTeacherDashboardStats = async (req, res) => {
  try {
    const teacherId = getTeacherIdentifier(req);

    if (!teacherId) {
      return res.status(400).json({
        message: 'teacherId is required',
      });
    }

    const dashboard = await buildTeacherDashboard(teacherId);

    if (!dashboard) {
      return res.status(404).json({
        message: 'Teacher not found',
      });
    }

    return res.status(200).json({
      message: 'Teacher dashboard stats fetched successfully',
      ...dashboard,
    });
  } catch (error) {
    console.error('Error fetching teacher dashboard stats:', error);
    return res.status(500).json({
      message: 'Failed to fetch teacher dashboard stats',
      error: error.message,
    });
  }
};

const getTodayClasses = async (req, res) => {
  try {
    const teacherId = getTeacherIdentifier(req);

    if (!teacherId) {
      return res.status(400).json({
        message: 'teacherId is required',
      });
    }

    const dashboard = await buildTeacherDashboard(teacherId);

    if (!dashboard) {
      return res.status(404).json({
        message: 'Teacher not found',
      });
    }

    return res.status(200).json({
      message: 'Teacher today classes fetched successfully',
      teacher: dashboard.teacher,
      date: new Date().toISOString().split('T')[0],
      classes: dashboard.todayClasses,
    });
  } catch (error) {
    console.error('Error fetching teacher today classes:', error);
    return res.status(500).json({
      message: 'Failed to fetch teacher today classes',
      error: error.message,
    });
  }
};

module.exports = {
  getTeacherDashboardStats,
  getTodayClasses,
};
