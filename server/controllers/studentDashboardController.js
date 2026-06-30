const Student    = require('../module/studentModel');
const Course     = require('../module/courseModel');
const Grade      = require('../module/gradeModel');
const Attendance = require('../module/attendanceModel');

const getStudentDashboardStats = async (req, res, next) => {
    try {
        const studentId = req.user.id;

        const student = await Student.findById(studentId)
            .select('-password')
            .populate('enrolledCourses', 'code name credits department');

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const courseIds = student.enrolledCourses.map((c) => c._id);

        const [totalGrades, attendanceRecords] = await Promise.all([
            Grade.countDocuments({ student: studentId, published: true }),
            Attendance.find({ student: studentId, course: { $in: courseIds } }).select('status'),
        ]);

        const totalClasses  = attendanceRecords.length;
        const presentCount  = attendanceRecords.filter((a) => a.status === 'Present').length;
        const attendancePct = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;

        return res.status(200).json({
            success: true,
            data: {
                student: {
                    firstName: student.firstName,
                    lastName: student.lastName,
                    studentId: student.studentId,
                    department: student.department,
                    yearOfStudy: student.yearOfStudy,
                },
                enrolledCourses: student.enrolledCourses,
                stats: {
                    totalCourses: courseIds.length,
                    totalGrades,
                    attendancePercentage: attendancePct,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

const getUpcomingClasses = async (req, res, next) => {
    try {
        const studentId = req.user.id;
        const student   = await Student.findById(studentId).select('enrolledCourses');

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const courses = await Course.find({
            _id: { $in: student.enrolledCourses },
            status: 'Active',
        }).select('code name department credits');

        return res.status(200).json({ success: true, data: courses });
    } catch (error) {
        next(error);
    }
};

module.exports = { getStudentDashboardStats, getUpcomingClasses };
