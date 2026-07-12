const Student = require("../module/studentModel");
const { DEFAULT_WEEKLY_SLOTS } = require("../utils/weeklyScheduleTemplate");

const getStudentSchedule = async (req, res) => {
  try {
    const { studentId } = req.query;

    const student = await Student.findOne({ studentId })
      .populate({
        path: "enrolledCourses",
        populate: {
          path: "teacher",
          select: "firstName lastName"
        }
      });

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    const activeCourses = student.enrolledCourses.filter(
      (course) => !course.status || course.status === "Active"
    );
    const courseMap = new Map(activeCourses.map((course) => [course.code, course]));

    const schedule = [];
    for (const slot of DEFAULT_WEEKLY_SLOTS) {
      if (slot.isOfficeHours) continue;

      const course = courseMap.get(slot.courseCode);
      if (course) {
        schedule.push({
          day: slot.day,
          time: slot.time,
          courseId: course._id,
          courseCode: course.code,
          courseName: course.name,
          room: slot.room,
          teacher: course.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}` : "—",
        });
      }
    }

    res.json({
      message: "Student schedule fetched successfully",
      schedule,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  getStudentSchedule
};
