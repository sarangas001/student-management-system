const Student = require('../module/studentModel');
const Course = require('../module/courseModel');
const Attendance = require('../module/attendanceModel');
const Grade = require('../module/gradeModel');

const buildReportData = async (reportType, department, fromDate, toDate) => {
    const deptFilter = department && department !== 'All Departments' ? { department, status: 'Active' } : { status: 'Active' };

    if (reportType === 'Attendance Report') {
        const students = await Student.find(deptFilter);
        const studentIds = students.map(s => s._id);

        const query = { student: { $in: studentIds } };
        if (fromDate || toDate) {
            query.date = {};
            if (fromDate) query.date.$gte = new Date(fromDate);
            if (toDate) query.date.$lte = new Date(toDate);
        }

        const records = await Attendance.find(query)
            .populate('student', 'firstName lastName studentId department')
            .populate('course', 'code name');

        const stats = {};
        students.forEach(s => {
            stats[s._id.toString()] = { student: s, total: 0, present: 0 };
        });

        records.forEach(a => {
            const sid = a.student?._id.toString();
            if (stats[sid]) {
                stats[sid].total++;
                if (a.status === 'Present' || a.status === 'Late') stats[sid].present++;
            }
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
        const students = await Student.find(deptFilter);
        const studentIds = students.map(s => s._id);
        const grades = await Grade.find({ student: { $in: studentIds } })
            .populate('student', 'firstName lastName studentId department');

        const stats = {};
        students.forEach(s => {
            stats[s._id.toString()] = { student: s, totalMarks: 0, count: 0 };
        });

        grades.forEach(g => {
            const sid = g.student?._id.toString();
            if (stats[sid]) {
                stats[sid].totalMarks += g.marks;
                stats[sid].count++;
            }
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
        const courseFilter = department && department !== 'All Departments' ? { department, status: 'Active' } : { status: 'Active' };
        const courses = await Course.find(courseFilter).populate('teacher', 'firstName lastName');
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
        const { reportType, department, fromDate, toDate } = req.query;

        if (!reportType) {
            return res.status(400).json({ success: false, message: 'reportType is required' });
        }

        const report = await buildReportData(reportType, department, fromDate, toDate);
        return res.json({ success: true, report });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const exportReport = async (req, res) => {
    try {
        const { reportType, format, department, fromDate, toDate } = req.query;

        if (!reportType || !format) {
            return res.status(400).json({ success: false, message: 'reportType and format are required' });
        }

        const report = await buildReportData(reportType, department, fromDate, toDate);

        if (format === 'csv') {
            const { rows } = report;
            if (!rows.length) {
                return res.status(400).json({ success: false, message: 'No data to export' });
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
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    generateReport,
    exportReport
};
