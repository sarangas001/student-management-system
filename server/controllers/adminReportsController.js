const Student = require('../module/studentModel');
const Teacher = require('../module/teacherModel');
const Course = require('../module/courseModel');
const Attendance = require('../module/attendanceModel');
const Grade = require('../module/gradeModel');

const buildReportData = async (reportType, department) => {
    const deptFilter = department && department !== 'All Departments' ? { department } : {};

    if (reportType === 'Attendance Report') {
        const students = await Student.find(deptFilter).select('_id');
        const studentIds = students.map(s => s._id);
        const records = await Attendance.find({ student: { $in: studentIds } })
            .populate('student', 'firstName lastName studentId department')
            .populate('course', 'code name');

        const stats = {};
        records.forEach(a => {
            const sid = a.student?._id.toString();
            if (!stats[sid]) {
                stats[sid] = { student: a.student, total: 0, present: 0 };
            }
            stats[sid].total++;
            if (a.status === 'Present' || a.status === 'Late') stats[sid].present++;
        });

        return {
            title: 'Attendance Report',
            department: department || 'All Departments',
            rows: Object.values(stats).map(s => ({
                'Student ID': s.student?.studentId,
                'Name': `${s.student?.firstName} ${s.student?.lastName}`,
                'Department': s.student?.department,
                'Total Classes': s.total,
                'Attended': s.present,
                'Percentage': s.total > 0 ? `${Math.round((s.present / s.total) * 100)}%` : '0%'
            }))
        };
    }

    if (reportType === 'Student Performance Report') {
        const students = await Student.find(deptFilter).select('_id');
        const studentIds = students.map(s => s._id);
        const grades = await Grade.find({ student: { $in: studentIds } })
            .populate('student', 'firstName lastName studentId department');

        const stats = {};
        grades.forEach(g => {
            const sid = g.student?._id.toString();
            if (!stats[sid]) {
                stats[sid] = { student: g.student, totalMarks: 0, count: 0 };
            }
            stats[sid].totalMarks += g.marks;
            stats[sid].count++;
        });

        return {
            title: 'Student Performance Report',
            department: department || 'All Departments',
            rows: Object.values(stats).map(s => ({
                'Student ID': s.student?.studentId,
                'Name': `${s.student?.firstName} ${s.student?.lastName}`,
                'Department': s.student?.department,
                'Avg Marks': s.count > 0 ? Math.round(s.totalMarks / s.count) : 0,
                'Assessments': s.count
            }))
        };
    }

    if (reportType === 'Course Report') {
        const courses = await Course.find(deptFilter).populate('teacher', 'firstName lastName');
        return {
            title: 'Course Report',
            department: department || 'All Departments',
            rows: courses.map(c => ({
                'Code': c.code,
                'Name': c.name,
                'Department': c.department,
                'Credits': c.credits,
                'Status': c.status,
                'Teacher': c.teacher ? `${c.teacher.firstName} ${c.teacher.lastName}` : 'Unassigned'
            }))
        };
    }

    if (reportType === 'Grade Report') {
        const students = await Student.find(deptFilter).select('_id');
        const studentIds = students.map(s => s._id);
        const grades = await Grade.find({ student: { $in: studentIds } })
            .populate('student', 'firstName lastName studentId')
            .populate('course', 'code name');

        return {
            title: 'Grade Report',
            department: department || 'All Departments',
            rows: grades.map(g => ({
                'Student ID': g.student?.studentId,
                'Name': `${g.student?.firstName} ${g.student?.lastName}`,
                'Course': g.course?.code,
                'Assessment': g.assessmentType,
                'Marks': g.marks,
                'Grade': g.grade
            }))
        };
    }

    return { title: reportType, department: department || 'All Departments', rows: [] };
};

const generateReport = async (req, res) => {
    try {
        const { reportType, department } = req.query;

        if (!reportType) {
            return res.json({ success: false, message: 'reportType is required' });
        }

        const report = await buildReportData(reportType, department);
        return res.json({ success: true, report });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

const exportReport = async (req, res) => {
    try {
        const { reportType, format, department } = req.query;

        if (!reportType || !format) {
            return res.json({ success: false, message: 'reportType and format are required' });
        }

        const report = await buildReportData(reportType, department);

        if (format === 'csv') {
            const { rows } = report;
            if (!rows.length) {
                return res.json({ success: false, message: 'No data to export' });
            }
            const headers = Object.keys(rows[0]).join(',');
            const lines = rows.map(r =>
                Object.values(r).map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
            );
            const csv = [headers, ...lines].join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${reportType.replace(/ /g, '_')}.csv"`);
            return res.send(csv);
        }

        return res.json({ success: true, report });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

module.exports = {
    generateReport,
    exportReport
};
