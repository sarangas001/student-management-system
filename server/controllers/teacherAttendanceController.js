const Teacher = require("../module/teacherModel");
const Course = require("../module/courseModel");
const Student = require("../module/studentModel");
const Attendance = require("../module/attendanceModel");

const VALID_STATUSES = ['Present', 'Absent', 'Late', 'Excused'];

const getAssignedCourses = async (teacher) => {
  return Course.find({
    $or: [
      { teacher: teacher._id },
      { _id: { $in: teacher.assignedCourses || [] } },
    ],
  });
};

const getTeacherCourses = async (req, res) => {
  try {
    const { teacherId } = req.query;

    if (!teacherId) {
      return res.status(400).json({ message: "teacherId is required" });
    }

    const teacher = await Teacher.findOne({ teacherId });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const assignedCourses = await getAssignedCourses(teacher);

    res.status(200).json(assignedCourses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getClassRoster = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({ message: "courseId is required" });
    }

    const students = await Student.find({
      enrolledCourses: courseId
    }).select("-password");

    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const submitAttendance = async (req, res) => {
  try {
    const { courseId, teacherId, date, attendanceData } = req.body;

    // Validation
    if (!courseId || !teacherId || !date || !Array.isArray(attendanceData) || attendanceData.length === 0) {
      return res.status(400).json({
        message: "courseId, teacherId, date, and attendanceData are required"
      });
    }

    const teacher = await Teacher.findOne({ teacherId });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Verify teacher is assigned to this course
    const assignedCourses = await getAssignedCourses(teacher);
    const isAssigned = assignedCourses.some(
      c => c._id.toString() === courseId.toString()
    );
    if (!isAssigned) {
      return res.status(403).json({ message: "You are not assigned to this course" });
    }

    const records = [];
    const errors = [];

    for (const item of attendanceData) {
      // Validate status value
      if (!VALID_STATUSES.includes(item.status)) {
        errors.push(`Invalid status '${item.status}' for student ${item.studentId}`);
        continue;
      }

      const student = await Student.findOne({ studentId: item.studentId });
      if (!student) {
        errors.push(`Student ${item.studentId} not found`);
        continue;
      }

      // Use upsert to prevent duplicate records for same student/course/date
      const record = await Attendance.findOneAndUpdate(
        {
          course: courseId,
          student: student._id,
          date: new Date(date)
        },
        {
          status: item.status,
          markedBy: teacher._id,
          markerModel: "Teacher"
        },
        { upsert: true, new: true }
      );

      records.push(record);
    }

    res.status(201).json({
      message: "Attendance submitted successfully",
      totalRecords: records.length,
      errors: errors.length > 0 ? errors : undefined,
      records
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTeacherCourses,
  getClassRoster,
  submitAttendance
};
