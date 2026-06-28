const Teacher = require("../module/teacherModel");
const Student = require("../module/studentModel");
const Attendance = require("../module/attendanceModel");

const getTeacherCourses = async (req, res) => {
  try {
    const { teacherId } = req.query;

    const teacher = await Teacher.findOne({ teacherId })
      .populate("assignedCourses");

    if (!teacher) {
      return res.status(404).json({
        message: "Teacher not found"
      });
    }

    res.status(200).json(teacher.assignedCourses);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const getClassRoster = async (req, res) => {
  try {
    const { courseId } = req.params;

    const students = await Student.find({
      enrolledCourses: courseId
    }).select("-password");

    res.status(200).json(students);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const submitAttendance = async (req, res) => {
  try {

    const {
      courseId,
      teacherId,
      date,
      attendanceData
    } = req.body;

    const teacher = await Teacher.findOne({ teacherId });

    if (!teacher) {
      return res.status(404).json({
        message: "Teacher not found"
      });
    }

    const records = [];

    for (const item of attendanceData) {

      const student = await Student.findOne({
        studentId: item.studentId
      });

      if (!student) {
        continue;
      }

      const attendance = await Attendance.create({
        course: courseId,
        student: student._id,
        date,
        status: item.status,
        markedBy: teacher._id,
        markerModel: "Teacher"
      });

      records.push(attendance);
    }

    res.status(201).json({
      message: "Attendance submitted successfully",
      totalRecords: records.length,
      records
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  getTeacherCourses,
  getClassRoster,
  submitAttendance
};
