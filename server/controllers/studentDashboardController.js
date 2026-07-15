const Student = require("../module/studentModel");
const Course = require("../module/courseModel");
const Grade = require("../module/gradeModel");
const Attendance = require("../module/attendanceModel");
const { DEFAULT_WEEKLY_SLOTS } = require("../utils/weeklyScheduleTemplate");

const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const GRADE_POINTS = {
  A: 4.0, "A-": 3.7, "B+": 3.3, B: 3.0, "B-": 2.7,
  "C+": 2.3, C: 2.0, "C-": 1.7, D: 1.0, F: 0,
};

// Dashboard Statistics
const getStudentDashboardStats = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    const student = await Student.findById(studentId)
      .select("-password")
      .populate({
        path: "enrolledCourses",
        select: "code name credits department status teacher",
        populate: { path: "teacher", select: "firstName lastName" },
      });

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
      }).populate("course", "credits"),

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

    let totalCredits = 0;
    let totalPoints = 0;
    grades.forEach((g) => {
      const credits = g.course?.credits || 0;
      const point = GRADE_POINTS[g.grade] ?? 0;
      totalCredits += credits;
      totalPoints += point * credits;
    });
    const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : null;

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
        courseId: course._id,
        code: course.code,
        name: course.name,
        teacher: course.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}` : "Unassigned",
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
        announcements: [],

        stats: {
          totalCourses: courseIds.length,
          attendancePercentage,
          gpa,
          atRiskCount: courses.filter((c) => c.status === "At Risk").length,
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

    const courseMap = new Map(courses.map((course) => [course.code, course]));

    const todayIndex = new Date().getDay();
    const todayDayOrderIndex = todayIndex === 0 ? 6 : todayIndex - 1;

    const upcoming = [];
    for (const slot of DEFAULT_WEEKLY_SLOTS) {
      if (slot.isOfficeHours) continue;

      const course = courseMap.get(slot.courseCode);
      if (!course) continue;

      upcoming.push({
        courseId: course._id,
        courseCode: course.code,
        courseName: course.name,
        day: slot.day,
        time: slot.time,
        venue: slot.room,
      });
    }

    upcoming.sort((a, b) => {
      const aRel = (DAY_ORDER.indexOf(a.day) - todayDayOrderIndex + 7) % 7;
      const bRel = (DAY_ORDER.indexOf(b.day) - todayDayOrderIndex + 7) % 7;
      return aRel - bRel;
    });

    return res.status(200).json({
      success: true,
      data: upcoming,
    });
  } catch (error) {
    next(error);
  }
};

// Fetch active available courses that the student is NOT currently enrolled in
const getAvailableCourses = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    const student = await Student.findById(studentId).select("enrolledCourses");
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // Get all Active courses not in student's enrolled list
    const courses = await Course.find({
      _id: { $nin: student.enrolledCourses },
      status: "Active"
    })
      .populate("teacher", "firstName lastName")
      .select("code name credits department status teacher")
      .lean();

    return res.status(200).json({ success: true, data: courses });
  } catch (error) {
    next(error);
  }
};

// Enroll current student in a course
const enrollInCourse = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ success: false, message: "courseId is required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    if (course.status !== "Active") {
      return res.status(400).json({ success: false, message: "Cannot enroll in an inactive/draft course" });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const alreadyEnrolled = student.enrolledCourses.some(
      (c) => c.toString() === courseId.toString()
    );
    if (alreadyEnrolled) {
      return res.status(409).json({ success: false, message: "Already enrolled in this course" });
    }

    student.enrolledCourses.push(courseId);
    await student.save();

    return res.status(200).json({
      success: true,
      message: `Successfully enrolled in ${course.code} — ${course.name}`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudentDashboardStats,
  getUpcomingClasses,
  getAvailableCourses,
  enrollInCourse,
};