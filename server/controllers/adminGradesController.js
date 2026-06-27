const Grade = require('../module/gradeModel');
const Course = require('../module/courseModel');

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
        return res.json({ success: false, message: error.message });
    }
};

const getGradesByCourseAndAssessment = async (req, res) => {
    try {
        const { courseId, assessmentType } = req.query;

        if (!courseId || !assessmentType) {
            return res.json({ success: false, message: 'courseId and assessmentType are required' });
        }

        const grades = await Grade.find({ course: courseId, assessmentType })
            .populate('student', 'firstName lastName studentId')
            .populate('course', 'code name');

        return res.json({ success: true, grades });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

const updateStudentGrade = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { courseId, assessmentType, marks } = req.body;

        if (!courseId || !assessmentType || marks === undefined) {
            return res.json({ success: false, message: 'courseId, assessmentType, and marks are required' });
        }

        const { grade, remark } = calculateGrade(Number(marks));

        const updatedGrade = await Grade.findOneAndUpdate(
            { student: studentId, course: courseId, assessmentType },
            { marks: Number(marks), grade, remark },
            { new: true, upsert: true }
        ).populate('student', 'firstName lastName studentId')
         .populate('course', 'code name');

        return res.json({ success: true, grade: updatedGrade });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

module.exports = {
    getCourseList,
    getGradesByCourseAndAssessment,
    updateStudentGrade
};
