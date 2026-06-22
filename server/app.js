const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const HOSTNAME = process.env.HOSTNAME || require('os').hostname();

require('dotenv').config();

const allowedOrigin = process.env.CLIENT_URL;

const app = express();
app.use(cors({origin: [allowedOrigin],credentials:true, methods: ['GET', 'POST', 'PUT', 'DELETE'],allowedHeaders: ['Content-Type', 'Authorization']}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Import routes
const studentRoutes = require('./routes/studentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const aiAssistentRoutes = require('./routes/aiAssistentRoutes');

const adminAttendanceRoutes = require('./routes/adminAttendanceRoutes');
const adminCoursesRoutes = require('./routes/adminCoursesRoutes');
const adminDashboardRoutes = require('./routes/adminDashboardRoutes');
const adminGradesRoutes = require('./routes/adminGradesRoutes');
const adminReportsRoutes = require('./routes/adminReportsRoutes');
const adminStudentsRoutes = require('./routes/adminStudentsRoutes');

const studentAttendanceRoutes = require('./routes/studentAttendanceRoutes');
const studentDashboardRoutes = require('./routes/studentDashboardRoutes');
const studentGradesRoutes = require('./routes/studentGradesRoutes');
const studentScheduleRoutes = require('./routes/studentScheduleRoutes');

const teacherAttendanceRoutes = require('./routes/teacherAttendanceRoutes');
const teacherDashboardRoutes = require('./routes/teacherDashboardRoutes');
const teacherGradesRoutes = require('./routes/teacherGradesRoutes');
const teacherScheduleRoutes = require('./routes/teacherScheduleRoutes');

// Connect routes
app.use('/api/students', studentRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/ai-assistent', aiAssistentRoutes);

app.use('/api/admin/attendance', adminAttendanceRoutes);
app.use('/api/admin/courses', adminCoursesRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin/grades', adminGradesRoutes);
app.use('/api/admin/reports', adminReportsRoutes);
app.use('/api/admin/students', adminStudentsRoutes);

app.use('/api/student/attendance', studentAttendanceRoutes);
app.use('/api/student/dashboard', studentDashboardRoutes);
app.use('/api/student/grades', studentGradesRoutes);
app.use('/api/student/schedule', studentScheduleRoutes);

app.use('/api/teacher/attendance', teacherAttendanceRoutes);
app.use('/api/teacher/dashboard', teacherDashboardRoutes);
app.use('/api/teacher/grades', teacherGradesRoutes);
app.use('/api/teacher/schedule', teacherScheduleRoutes);

app.get("/", (req, res) => {
  res.send({ 
    message: "Hello from Simple App (Node)",
    container: HOSTNAME 
    });
});

module.exports = app;
