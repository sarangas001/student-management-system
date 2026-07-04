const Grade = require('../module/gradeModel');

// ── Grade point lookup table ──────────────────────────────────────────────────
const GRADE_POINTS = {
  'A':  4.0,
  'A-': 3.7,
  'B+': 3.3,
  'B':  3.0,
  'B-': 2.7,
  'C+': 2.3,
  'C':  2.0,
  'C-': 1.7,
  'D':  1.0,
  'F':  0.0,
};

// ── GET /api/student/grades ───────────────────────────────────────────────────
// Returns all published grade records for the authenticated student.
const getStudentGrades = async (req, res, next) => {
  try {
    const studentId = req.user.id; // ObjectId from JWT — no query param needed

    const grades = await Grade.find({ student: studentId, published: true })
      .populate('course', 'code name credits department')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: grades });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/student/grades/cgpa ──────────────────────────────────────────────
// Calculates and returns the CGPA for the authenticated student.
const getStudentCGPA = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    const grades = await Grade.find({ student: studentId, published: true })
      .populate('course', 'credits');

    if (grades.length === 0) {
      return res.status(200).json({
        success: true,
        data: { cgpa: '0.00', totalCredits: 0, gradedCourses: 0 },
      });
    }

    let totalCredits = 0;
    let totalPoints  = 0;

    grades.forEach((g) => {
      const credits = g.course?.credits ?? 0;
      const points  = GRADE_POINTS[g.grade] ?? 0;
      totalCredits += credits;
      totalPoints  += points * credits;
    });

    const cgpa = totalCredits > 0
      ? (totalPoints / totalCredits).toFixed(2)
      : '0.00';

    return res.status(200).json({
      success: true,
      data: {
        cgpa,
        totalCredits,
        gradedCourses: new Set(grades.map((g) => g.course?._id?.toString())).size,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStudentGrades, getStudentCGPA };