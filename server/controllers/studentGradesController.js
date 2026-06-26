const Grade = require('../module/gradeModel');
const Course = require('../module/courseModel');

// Grade letter -> GPA point mapping (reuse same as dashboard)
const gradeToGPA = { 'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D': 1.0, 'F': 0.0 };

// Returns an array of grade entries for the logged‑in student (published grades only)
const getStudentGrades = async (req, res) => {
  try {
    const studentId = req.userId;
    const grades = await Grade.find({ student: studentId, published: true })
      .populate('course', 'code name')
      .sort({ createdAt: -1 });

    const formatted = grades.map(g => ({
      courseId: g.course._id,
      courseCode: g.course.code,
      courseName: g.course.name,
      assessmentType: g.assessmentType,
      marks: g.marks,
      grade: g.grade,
      published: g.published
    }));

    return res.status(200).json({ success: true, grades: formatted });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Compute cumulative GPA for the logged‑in student (published grades only)
const getStudentCGPA = async (req, res) => {
  try {
    const studentId = req.userId;
    const grades = await Grade.find({ student: studentId, published: true });
    if (grades.length === 0) {
      return res.status(200).json({ success: true, cgpa: null });
    }
    const totalPoints = grades.reduce((sum, g) => sum + (gradeToGPA[g.grade] ?? 0), 0);
    const cgpa = parseFloat((totalPoints / grades.length).toFixed(2));
    return res.status(200).json({ success: true, cgpa });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getStudentGrades, getStudentCGPA };
