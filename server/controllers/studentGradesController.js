const Grade = require("../module/gradeModel");
const Student = require("../module/studentModel");

const getStudentGrades = async (req, res) => {
  try {
    const { studentId } = req.query;

    const student = await Student.findOne({ studentId });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const grades = await Grade.find({ student: student._id })
      .populate("course", "code name credits");

    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudentCGPA = async (req, res) => {
  try {
    const { studentId } = req.query;

    const student = await Student.findOne({ studentId });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const grades = await Grade.find({ student: student._id })
      .populate("course", "credits");

    if (grades.length === 0) {
      return res.json({
        cgpa: 0
      });
    }

    const gradePoints = {
      A: 4.0,
      "A-": 3.7,
      "B+": 3.3,
      B: 3.0,
      "B-": 2.7,
      "C+": 2.3,
      C: 2.0,
      "C-": 1.7,
      D: 1.0,
      F: 0
    };

    let totalCredits = 0;
    let totalPoints = 0;

    grades.forEach((g) => {
      const credits = g.course.credits;
      const point = gradePoints[g.grade] || 0;

      totalCredits += credits;
      totalPoints += point * credits;
    });

    const cgpa = totalPoints / totalCredits;

    res.json({
      cgpa: cgpa.toFixed(2)
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStudentGrades,
  getStudentCGPA
};