const Teacher = require('../module/teacherModel');
const Course = require('../module/courseModel');
const Student = require('../module/studentModel');

const getTeacherIdentifier = (req) => {
  return req.query.teacherId || req.params.teacherId || req.body?.teacherId;
};

const DEFAULT_WEEKLY_SLOTS = [
  { day: 'Monday', time: '08:00 AM - 10:00 AM', room: 'A201' },
  { day: 'Monday', time: '10:00 AM - 12:00 PM', room: 'B105' },
  { day: 'Wednesday', time: '08:00 AM - 10:00 AM', room: 'A201' },
  { day: 'Wednesday', time: '02:00 PM - 04:00 PM', room: 'C302' },
  { day: 'Thursday', time: '02:00 PM - 03:00 PM', room: 'Staff Block' },
  { day: 'Friday', time: '10:00 AM - 12:00 PM', room: 'B105' },
];

const getTeacherContext = async (teacherId) => {
  const teacher = await Teacher.findOne({ teacherId }).lean();

  if (!teacher) {
    return null;
  }

  const courses = await Course.find({
    $or: [
      { teacher: teacher._id },
      { _id: { $in: teacher.assignedCourses || [] } },
    ],
  })
    .select('_id code name credits department status teacher')
    .lean();

  return { teacher, courses };
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

const buildScheduleRows = async (courses) => {
  const activeCourses = courses.filter((course) => !course.status || course.status === 'Active');
  const studentCounts = await getCourseStudentCounts(activeCourses.map((course) => course._id));

  if (activeCourses.length === 0) {
    return [];
  }

  return activeCourses.map((course, index) => {
    const slot = DEFAULT_WEEKLY_SLOTS[index % DEFAULT_WEEKLY_SLOTS.length];

    return {
      day: slot.day,
      time: slot.time,
      courseId: course._id,
      courseCode: course.code,
      courseName: course.name,
      room: slot.room,
      studentCount: studentCounts.get(String(course._id)) || 0,
      credits: course.credits,
      status: course.status || 'Active',
    };
  });
};

const getTeacherSchedule = async (req, res) => {
  try {
    const teacherId = getTeacherIdentifier(req);

    if (!teacherId) {
      return res.status(400).json({
        message: 'teacherId is required',
      });
    }

    const context = await getTeacherContext(teacherId);

    if (!context) {
      return res.status(404).json({
        message: 'Teacher not found',
      });
    }

    const schedule = await buildScheduleRows(context.courses);

    return res.status(200).json({
      message: 'Teacher schedule fetched successfully',
      teacher: {
        teacherId: context.teacher.teacherId,
        firstName: context.teacher.firstName,
        lastName: context.teacher.lastName,
        department: context.teacher.department,
      },
      schedule,
    });
  } catch (error) {
    console.error('Error fetching teacher schedule:', error);
    return res.status(500).json({
      message: 'Failed to fetch teacher schedule',
      error: error.message,
    });
  }
};

module.exports = {
  getTeacherSchedule,
};
