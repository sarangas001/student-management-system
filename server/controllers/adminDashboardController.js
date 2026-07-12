const Student = require('../module/studentModel');
const Attendance = require('../module/attendanceModel');
const Grade = require('../module/gradeModel');
const Teacher = require("../module/teacherModel");
const Course = require("../module/courseModel");

const getDashboardStats = async (req, res) => {
  try {
    const [totalStudents, totalTeachers, totalCourses, attendanceCounts] = await Promise.all([
      Student.countDocuments(),
      Teacher.countDocuments(),
      Course.countDocuments(),
      Attendance.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            present: {
              $sum: { $cond: [{ $in: ['$status', ['Present', 'Late']] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    const { total = 0, present = 0 } = attendanceCounts[0] || {};
    const avgAttendance = total > 0 ? Math.round((present / total) * 100) : 0;

    res.status(200).json({
      totalStudents,
      totalTeachers,
      totalCourses,
      avgAttendance,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getAttendanceByCourse = async (req, res) => {
  try {
    const results = await Attendance.aggregate([
      {
        $group: {
          _id: '$course',
          total: { $sum: 1 },
          present: {
            $sum: { $cond: [{ $in: ['$status', ['Present', 'Late']] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'course',
        },
      },
      { $unwind: '$course' },
      {
        $project: {
          _id: 0,
          courseId: '$course._id',
          code: '$course.code',
          name: '$course.name',
          percentage: {
            $round: [{ $multiply: [{ $divide: ['$present', '$total'] }, 100] }, 0],
          },
        },
      },
      { $sort: { code: 1 } },
    ]);

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRecentActivities = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const [recentStudents, recentAttendance, recentGrades] = await Promise.all([
            Student.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select('firstName lastName studentId createdAt'),

            Attendance.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('student', 'firstName lastName')
                .populate('course', 'code name'),

            Grade.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('student', 'firstName lastName')
                .populate('course', 'code name')
        ]);

        const activities = [];

        recentStudents.forEach(s => {
            activities.push({
                type: 'student_registered',
                description: `New student ${s.firstName} ${s.lastName} registered`,
                studentId: s.studentId,
                date: s.createdAt,
                icon: 'user'
            });
        });

        recentAttendance.forEach(a => {
            const studentName = a.student ? `${a.student.firstName} ${a.student.lastName}` : 'Unknown';
            const courseCode = a.course ? a.course.code : 'Unknown';
            activities.push({
                type: 'attendance_marked',
                description: `Attendance marked for ${studentName} in ${courseCode}`,
                status: a.status,
                date: a.createdAt,
                icon: 'calendar'
            });
        });

        recentGrades.forEach(g => {
            const studentName = g.student ? `${g.student.firstName} ${g.student.lastName}` : 'Unknown';
            const courseCode = g.course ? g.course.code : 'Unknown';
            activities.push({
                type: 'grade_published',
                description: `${g.assessmentType} grade (${g.grade}) recorded for ${studentName} in ${courseCode}`,
                date: g.createdAt,
                icon: 'chart'
            });
        });

        activities.sort((a, b) => new Date(b.date) - new Date(a.date));

        return res.json({
            success: true,
            activities: activities.slice(0, limit)
        });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

module.exports = {
    getDashboardStats,
    getRecentActivities,
    getAttendanceByCourse
};
