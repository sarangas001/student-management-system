const Grade = require('../module/gradeModel');
const Course = require('../module/courseModel');
const Student = require('../module/studentModel');

const calculateGrade = (marks) => {
    if (marks >= 90) return { grade: 'A+', remark: 'Outstanding' };
    if (marks >= 85) return { grade: 'A',  remark: 'Excellent' };
    if (marks >= 80) return { grade: 'A-', remark: 'Excellent' };
    if (marks >= 75) return { grade: 'B+', remark: 'Good' };
    if (marks >= 70) return { grade: 'B',  remark: 'Good' };
    if (marks >= 65) return { grade: 'B-', remark: 'Average' };
    if (marks >= 60) return { grade: 'C+', remark: 'Average' };
    if (marks >= 55) return { grade: 'C',  remark: 'Below Average' };
    if (marks >= 50) return { grade: 'C-', remark: 'Below Average' };
    if (marks >= 40) return { grade: 'D',  remark: 'Poor' };
    return { grade: 'F', remark: 'Fail' };
};

const getCourseList = async (req, res) => {
    try {
        const courses = await Course.find({ status: 'Active' }).select('_id code name');
        return res.json({ success: true, courses });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getGradesByCourseAndAssessment = async (req, res) => {
    try {
        const { courseId, assessmentType } = req.query;

        if (!courseId || !assessmentType) {
            return res.status(400).json({ success: false, message: 'courseId and assessmentType are required' });
        }

        // Find all active students enrolled in this course
        const enrolledStudents = await Student.find({
            enrolledCourses: courseId,
            status: 'Active'
        }).select('_id firstName lastName studentId');

        // Find all grades already entered for this course and assessment
        const existingGrades = await Grade.find({ course: courseId, assessmentType });

        // Map existing grades by student ID for quick lookup
        const gradeMap = new Map();
        existingGrades.forEach(g => {
            if (g.student) {
                gradeMap.set(g.student.toString(), g);
            }
        });

        // Construct the list of grades for all enrolled students
        const grades = enrolledStudents.map(student => {
            const existing = gradeMap.get(student._id.toString());
            if (existing) {
                return {
                    _id: existing._id,
                    student: student,
                    course: courseId,
                    assessmentType,
                    marks: existing.marks,
                    grade: existing.grade,
                    remark: existing.remark,
                    published: existing.published,
                };
            } else {
                return {
                    _id: `temp_${student._id}`, // temporary unique ID
                    student: student,
                    course: courseId,
                    assessmentType,
                    marks: 0,
                    grade: 'F',
                    remark: 'Not Graded',
                    published: false,
                };
            }
        });

        return res.json({ success: true, grades });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateStudentGrade = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { courseId, assessmentType, marks } = req.body;

        if (!courseId || !assessmentType || marks === undefined) {
            return res.status(400).json({ success: false, message: 'courseId, assessmentType, and marks are required' });
        }

        const numericMarks = Number(marks);
        if (isNaN(numericMarks) || numericMarks < 0 || numericMarks > 100) {
            return res.status(400).json({ success: false, message: 'Marks must be a valid number between 0 and 100' });
        }

        const { grade, remark } = calculateGrade(numericMarks);

        const updatedGrade = await Grade.findOneAndUpdate(
            { student: studentId, course: courseId, assessmentType },
            { marks: numericMarks, grade, remark },
            { new: true, upsert: true }
        ).populate('student', 'firstName lastName studentId')
         .populate('course', 'code name');

        return res.json({ success: true, grade: updatedGrade });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getCourseList,
    getGradesByCourseAndAssessment,
    updateStudentGrade
};

