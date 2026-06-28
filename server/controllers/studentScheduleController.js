const Student = require("../module/studentModel");

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

    res.json(student.enrolledCourses);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  getStudentSchedule
};