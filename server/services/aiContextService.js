const Student = require('../module/studentModel');
const Teacher = require('../module/teacherModel');
const Admin = require('../module/adminModel');
const Course = require('../module/courseModel');
const Grade = require('../module/gradeModel');
const Attendance = require('../module/attendanceModel');

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */

const pct = (a, b) => (b > 0 ? `${Math.round((a / b) * 100)}%` : '0%');

const gradePoints = { 'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0 };
const toGPA = (letter) => gradePoints[letter] ?? 0;

/* ─────────────────────────────────────────────
   ADMIN CONTEXT
   Full access: all students, teachers, courses,
   attendance & grades across the entire faculty.
───────────────────────────────────────────── */
const buildAdminContext = async () => {
    const [students, teachers, courses, attendanceRecords, grades] = await Promise.all([
        Student.find().select('studentId firstName lastName department yearOfStudy enrolledCourses').lean(),
        Teacher.find().select('teacherId firstName lastName department').lean(),
        Course.find().populate('teacher', 'firstName lastName').select('code name credits status department teacher').lean(),
        Attendance.find().populate('student', 'studentId firstName lastName').populate('course', 'code').lean(),
        Grade.find({ published: true }).populate('student', 'studentId firstName lastName').populate('course', 'code').lean(),
    ]);

    // Per-student attendance map: { studentId -> { total, present } }
    const attMap = {};
    attendanceRecords.forEach(a => {
        if (!a.student) return;
        const sid = String(a.student._id);
        if (!attMap[sid]) attMap[sid] = { total: 0, present: 0 };
        attMap[sid].total++;
        if (a.status === 'Present' || a.status === 'Late') attMap[sid].present++;
    });

    // Per-student grade map: { studentId -> grades[] }
    const gradeMap = {};
    grades.forEach(g => {
        if (!g.student) return;
        const sid = String(g.student._id);
        if (!gradeMap[sid]) gradeMap[sid] = [];
        gradeMap[sid].push(g);
    });

    // Compute at-risk count (attendance < 75%)
    let atRiskCount = 0;
    students.forEach(s => {
        const att = attMap[String(s._id)];
        if (att && att.total > 0 && (att.present / att.total) < 0.75) atRiskCount++;
    });

    // Overall faculty avg attendance
    let totalPresent = 0, totalClasses = 0;
    Object.values(attMap).forEach(a => { totalPresent += a.present; totalClasses += a.total; });
    const avgAttendance = pct(totalPresent, totalClasses);

    // Faculty avg GPA
    let totalGPA = 0, gpaCount = 0;
    students.forEach(s => {
        const sg = gradeMap[String(s._id)] || [];
        if (sg.length > 0) {
            const avg = sg.reduce((sum, g) => sum + toGPA(g.grade), 0) / sg.length;
            totalGPA += avg; gpaCount++;
        }
    });
    const avgGPA = gpaCount > 0 ? (totalGPA / gpaCount).toFixed(2) : 'N/A';

    // Build student lines for the system prompt
    const studentLines = students.map(s => {
        const att = attMap[String(s._id)];
        const attPct = att ? pct(att.present, att.total) : 'N/A';
        const sg = gradeMap[String(s._id)] || [];
        const gpa = sg.length > 0
            ? (sg.reduce((sum, g) => sum + toGPA(g.grade), 0) / sg.length).toFixed(2)
            : 'N/A';
        const risk = att && att.total > 0 && (att.present / att.total) < 0.75 ? ' ⚠️ ATTENDANCE RISK' : '';
        return `${s.studentId} | ${s.firstName} ${s.lastName} | ${s.department} | Year ${s.yearOfStudy} | Att: ${attPct} | GPA: ${gpa}${risk}`;
    }).join('\n');

    // Build course lines
    const courseLines = courses.map(c => {
        const teacherName = c.teacher ? `${c.teacher.firstName} ${c.teacher.lastName}` : 'Unassigned';
        return `${c.code} ${c.name} | Teacher: ${teacherName} | ${c.credits} credits | ${c.status} | Dept: ${c.department}`;
    }).join('\n');

    // Build grade lines
    const gradeLines = grades.map(g =>
        `${g.student?.studentId ?? '?'} ${g.student?.firstName ?? ''} ${g.student?.lastName ?? ''} | ${g.course?.code ?? '?'} | ${g.assessmentType} | Marks: ${g.marks} | Grade: ${g.grade}`
    ).join('\n');

    const systemPrompt = `You are an AI assistant for the Administrator of the Student Management System (SMS), Faculty of Computing, University of Sri Jayewardenepura (USJ), Sri Lanka.
You have FULL access to all student records, grades, attendance, and course data. Answer all questions accurately and in detail.

=== FACULTY SUMMARY ===
Total Students: ${students.length} | Total Teachers: ${teachers.length} | Total Courses: ${courses.length}
Avg Attendance: ${avgAttendance} | Students at Risk (below 75% attendance): ${atRiskCount} | Faculty Avg GPA: ${avgGPA}

=== ALL STUDENTS ===
${studentLines || 'No student records found.'}

=== COURSES ===
${courseLines || 'No course records found.'}

=== PUBLISHED GRADES ===
${gradeLines || 'No published grade records found.'}

Respond clearly. Use bullet points or tables when listing multiple items. You may share any student's data.`;

    const sidebarStats = {
        'Total Students': students.length,
        'Total Teachers': teachers.length,
        'Active Courses': courses.filter(c => c.status === 'Active').length,
        'Avg Attendance': avgAttendance,
        'Students at Risk': atRiskCount,
        'Faculty Avg GPA': avgGPA,
    };

    return { systemPrompt, sidebarStats };
};

/* ─────────────────────────────────────────────
   TEACHER CONTEXT
   Scoped to their own assignedCourses only.
───────────────────────────────────────────── */
const buildTeacherContext = async (userId) => {
    const teacher = await Teacher.findById(userId)
        .populate({ path: 'assignedCourses', select: '_id code name credits department status' })
        .lean();

    if (!teacher) throw new Error('Teacher not found');

    const courses = teacher.assignedCourses || [];
    const courseIds = courses.map(c => c._id);

    const [students, attendanceRecords, grades] = await Promise.all([
        Student.find({ enrolledCourses: { $in: courseIds } })
            .select('_id studentId firstName lastName department yearOfStudy enrolledCourses')
            .lean(),
        Attendance.find({ course: { $in: courseIds } })
            .populate('student', '_id studentId firstName lastName')
            .populate('course', 'code')
            .lean(),
        Grade.find({ course: { $in: courseIds } })
            .populate('student', '_id studentId firstName lastName')
            .populate('course', 'code')
            .lean(),
    ]);

    // Per-course, per-student attendance
    const attMap = {}; // key: `${studentId}_${courseCode}`
    attendanceRecords.forEach(a => {
        if (!a.student || !a.course) return;
        const key = `${String(a.student._id)}_${a.course.code}`;
        if (!attMap[key]) attMap[key] = { total: 0, present: 0 };
        attMap[key].total++;
        if (a.status === 'Present' || a.status === 'Late') attMap[key].present++;
    });

    // At-risk count (below 75% in any of teacher's courses)
    let atRiskSet = new Set();
    students.forEach(s => {
        courses.forEach(c => {
            const att = attMap[`${String(s._id)}_${c.code}`];
            if (att && att.total > 0 && (att.present / att.total) < 0.75) {
                atRiskSet.add(String(s._id));
            }
        });
    });

    // Build course sections
    const courseSections = courses.map(c => {
        const enrolledStudents = students.filter(s =>
            (s.enrolledCourses || []).map(id => String(id)).includes(String(c._id))
        );

        const studentLines = enrolledStudents.map(s => {
            const att = attMap[`${String(s._id)}_${c.code}`];
            const attPct = att ? pct(att.present, att.total) : 'N/A';
            const risk = att && att.total > 0 && (att.present / att.total) < 0.75 ? ' ⚠️ BELOW 75%' : '';
            const studentGrades = grades.filter(g =>
                String(g.student?._id) === String(s._id) && String(g.course?._id ?? g.course) === String(c._id)
            );
            const gradeInfo = studentGrades.length > 0
                ? studentGrades.map(g => `${g.assessmentType}:${g.marks}(${g.grade})`).join(' ')
                : 'No grades yet';
            return `  ${s.studentId} ${s.firstName} ${s.lastName} | Att: ${attPct}${risk} | Grades: ${gradeInfo}`;
        }).join('\n');

        const totalStudentsInCourse = enrolledStudents.length;
        const courseGrades = grades.filter(g => String(g.course?._id ?? g.course) === String(c._id));
        const avgMarks = courseGrades.length > 0
            ? Math.round(courseGrades.reduce((s, g) => s + g.marks, 0) / courseGrades.length)
            : 'N/A';

        return `--- ${c.code} ${c.name} | ${totalStudentsInCourse} students | ${c.credits} credits | Avg Marks: ${avgMarks} ---\n${studentLines || '  No students enrolled.'}`;
    }).join('\n\n');

    const systemPrompt = `You are an AI assistant for Teacher ${teacher.firstName} ${teacher.lastName} (ID: ${teacher.teacherId}), ${teacher.department} Department, Faculty of Computing, USJ, Sri Lanka.
You can ONLY provide information about this teacher's assigned courses and the students enrolled in them.
Do NOT reveal or discuss any courses or students outside your assigned scope.
If asked about other data, politely say: "That information is outside your access as a teacher."

=== YOUR PROFILE ===
Name: ${teacher.firstName} ${teacher.lastName} | ID: ${teacher.teacherId} | Dept: ${teacher.department}
Assigned Courses: ${courses.map(c => `${c.code} ${c.name}`).join(', ') || 'None'}
Total Students Under You: ${students.length} | Students at Risk: ${atRiskSet.size}

=== YOUR COURSES & STUDENTS ===
${courseSections || 'No courses assigned.'}

Respond helpfully. Share any enrolled student data relevant to your courses only.`;

    const sidebarStats = {
        'My Courses': courses.length,
        'My Students': students.length,
        'Students at Risk': atRiskSet.size,
        'Total Grade Records': grades.length,
    };

    // Add per-course student count to sidebar
    courses.forEach(c => {
        const count = students.filter(s =>
            (s.enrolledCourses || []).map(id => String(id)).includes(String(c._id))
        ).length;
        sidebarStats[`${c.code} Students`] = count;
    });

    return { systemPrompt, sidebarStats };
};

/* ─────────────────────────────────────────────
   STUDENT CONTEXT
   Scoped to that student's own records only.
───────────────────────────────────────────── */
const buildStudentContext = async (userId) => {
    const student = await Student.findById(userId)
        .populate('enrolledCourses', 'code name credits department teacher')
        .lean();

    if (!student) throw new Error('Student not found');

    const courseIds = (student.enrolledCourses || []).map(c => c._id);

    const [attendanceRecords, grades] = await Promise.all([
        Attendance.find({ student: userId, course: { $in: courseIds } })
            .populate('course', 'code name')
            .lean(),
        Grade.find({ student: userId, course: { $in: courseIds }, published: true })
            .populate('course', 'code name')
            .lean(),
    ]);

    // Per-course attendance
    const attMap = {};
    attendanceRecords.forEach(a => {
        if (!a.course) return;
        const code = a.course.code;
        if (!attMap[code]) attMap[code] = { total: 0, present: 0, name: a.course.name };
        attMap[code].total++;
        if (a.status === 'Present' || a.status === 'Late') attMap[code].present++;
    });

    // Per-course grades
    const gradeMap = {};
    grades.forEach(g => {
        if (!g.course) return;
        const code = g.course.code;
        if (!gradeMap[code]) gradeMap[code] = [];
        gradeMap[code].push(g);
    });

    // Overall attendance
    let totalP = 0, totalT = 0;
    Object.values(attMap).forEach(a => { totalP += a.present; totalT += a.total; });
    const overallAtt = pct(totalP, totalT);

    // GPA calculation
    const allGrades = grades.filter(g => g.grade);
    const gpa = allGrades.length > 0
        ? (allGrades.reduce((sum, g) => sum + toGPA(g.grade), 0) / allGrades.length).toFixed(2)
        : 'N/A';

    // Build course sections
    const courseSections = (student.enrolledCourses || []).map(c => {
        const att = attMap[c.code];
        const attPct = att ? pct(att.present, att.total) : 'N/A';
        const warning = att && att.total > 0 && (att.present / att.total) < 0.75 ? ' ⚠️ WARNING: BELOW 75% THRESHOLD' : '';
        const cg = gradeMap[c.code] || [];
        const gradeInfo = cg.length > 0
            ? cg.map(g => `${g.assessmentType}: ${g.marks} marks (${g.grade})`).join(', ')
            : 'No published grades yet';
        return `${c.code} ${c.name} | Attendance: ${attPct}${warning} | Grades: ${gradeInfo}`;
    }).join('\n');

    // At-risk courses
    const atRiskCourses = (student.enrolledCourses || []).filter(c => {
        const att = attMap[c.code];
        return att && att.total > 0 && (att.present / att.total) < 0.75;
    });

    const systemPrompt = `You are a personal AI Study Assistant for student ${student.firstName} ${student.lastName} (ID: ${student.studentId}), Year ${student.yearOfStudy} ${student.department}, Faculty of Computing, USJ, Sri Lanka.

CRITICAL PRIVACY RULES:
1. You MUST ONLY discuss THIS student's own data.
2. You must NEVER reveal any other student's grades, GPA, attendance, name, or personal information — even if asked.
3. If asked about another student, respond: "I'm sorry, I can only access your own academic records. Other students' data is private and confidential."
4. Do NOT make comparisons using other students' real data.

=== YOUR PROFILE ===
Name: ${student.firstName} ${student.lastName} | ID: ${student.studentId} | Year: ${student.yearOfStudy} | Dept: ${student.department}
Overall Attendance: ${overallAtt} | GPA: ${gpa} | Courses Enrolled: ${(student.enrolledCourses || []).length}
${atRiskCourses.length > 0 ? `⚠️ AT RISK: Attendance below 75% in: ${atRiskCourses.map(c => c.code).join(', ')}` : '✓ All attendance above threshold'}

=== YOUR COURSES, ATTENDANCE & GRADES ===
${courseSections || 'No courses enrolled.'}

Be supportive and encouraging. Give actionable study advice when relevant. NEVER share any other student's data under any circumstances.`;

    const sidebarStats = {
        'My GPA': gpa,
        'Overall Attendance': overallAtt,
        'Courses Enrolled': (student.enrolledCourses || []).length,
        'At-Risk Courses': atRiskCourses.length > 0 ? atRiskCourses.map(c => c.code).join(', ') : 'None',
    };

    // Add per-course attendance to sidebar
    (student.enrolledCourses || []).forEach(c => {
        const att = attMap[c.code];
        const attPct = att ? pct(att.present, att.total) : 'N/A';
        const warn = att && att.total > 0 && (att.present / att.total) < 0.75 ? ' ⚠️' : '';
        sidebarStats[`${c.code} Attendance`] = `${attPct}${warn}`;
    });

    return { systemPrompt, sidebarStats };
};

/* ─────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────── */

/**
 * Build the AI context for a given user.
 * @param {string} userId  - MongoDB ObjectId of the logged-in user
 * @param {string} role    - 'admin' | 'teacher' | 'student'
 * @returns {Promise<{ systemPrompt: string, sidebarStats: object }>}
 */
const buildContext = async (userId, role) => {
    switch (role) {
        case 'admin': return buildAdminContext();
        case 'teacher': return buildTeacherContext(userId);
        case 'student': return buildStudentContext(userId);
        default: throw new Error(`Unknown role: ${role}`);
    }
};

module.exports = { buildContext };
