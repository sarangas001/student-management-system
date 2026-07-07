const Student = require("../module/studentModel");
const Course = require("../module/courseModel");
const Grade = require("../module/gradeModel");
const Attendance = require("../module/attendanceModel");

// Dashboard Statistics
const getStudentDashboardStats = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    const student = await Student.findById(studentId)
      .select("-password")
      .populate("enrolledCourses", "code name credits department");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const courseIds = student.enrolledCourses.map((course) => course._id);

    const [grades, attendanceRecords] = await Promise.all([
      Grade.find({
        student: studentId,
        published: true,
      }),

      Attendance.find({
        student: studentId,
        course: { $in: courseIds },
      }).select("course status"),
    ]);

    const totalClasses = attendanceRecords.length;

    const presentClasses = attendanceRecords.filter(
      (record) => record.status === "Present"
    ).length;

    const attendancePercentage =
      totalClasses > 0
        ? Math.round((presentClasses / totalClasses) * 100)
        : 0;

    const gpa =
      grades.length > 0
        ? (
            grades.reduce(
              (sum, grade) => sum + (grade.gradePoint || 0),
              0
            ) / grades.length
          ).toFixed(2)
        : 0;

    const courses = student.enrolledCourses.map((course) => {
      const records = attendanceRecords.filter(
        (a) => a.course.toString() === course._id.toString()
      );

      const present = records.filter(
        (r) => r.status === "Present"
      ).length;

      const percentage =
        records.length > 0
          ? (present / records.length) * 100
          : 100;

      return {
        _id: course._id,
        code: course.code,
        name: course.name,
        department: course.department,
        status: percentage >= 75 ? "On Track" : "At Risk",
      };
    });

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

        courses,

        stats: {
          totalCourses: courseIds.length,
          attendancePercentage,
          gpa,
          pendingTasks: 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Upcoming Classes
const getUpcomingClasses = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    const student = await Student.findById(studentId).select(
      "enrolledCourses"
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const courses = await Course.find({
      _id: { $in: student.enrolledCourses },
      status: "Active",
    }).select("code name department credits");

    return res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudentDashboardStats,
  getUpcomingClasses,
};