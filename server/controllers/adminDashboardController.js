


const Student = require("../module/studentModel");
const Teacher = require("../module/teacherModel");
const Course = require("../module/courseModel");

const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalTeachers = await Teacher.countDocuments();
    const totalCourses = await Course.countDocuments();

    res.status(200).json({
      totalStudents,
      totalTeachers,
      totalCourses,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getRecentActivities = async (req, res) => {
  try {
    const activities = [
      {
        title: "Course Added",
        description: "Software Engineering course added successfully",
      },
      {
        title: "Teacher Assigned",
        description: "Teacher assigned to CSE301",
      },
      {
        title: "Student Registered",
        description: "New student account created",
      },
    ];

    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
  getRecentActivities,
};