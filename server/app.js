const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const HOSTNAME = process.env.HOSTNAME || require('os').hostname();

require('dotenv').config();

const allowedOrigin = process.env.CLIENT_URL;

const app = express();

app.use(helmet());
app.use(cors({origin: [allowedOrigin],credentials:true, methods: ['GET', 'POST', 'PUT', 'DELETE'],allowedHeaders: ['Content-Type', 'Authorization']}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

const authMiddleware = require('./middleware/authMiddleware');
const roleMiddleware = require('./middleware/roleMiddleware');
const { generalLimiter } = require('./middleware/rateLimiter');
app.use(generalLimiter);

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

// Auth routes
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

// Protected routes - require authentication
app.use('/api/students', authMiddleware, studentRoutes);
app.use('/api/admins', authMiddleware, roleMiddleware('admin'), adminRoutes);
app.use('/api/teachers', authMiddleware, teacherRoutes);
app.use('/api/ai-assistent', authMiddleware, aiAssistentRoutes);

app.use('/api/admin/attendance', authMiddleware, roleMiddleware('admin'), adminAttendanceRoutes);
app.use('/api/admin/courses', authMiddleware, roleMiddleware('admin'), adminCoursesRoutes);
app.use('/api/admin/dashboard', authMiddleware, roleMiddleware('admin'), adminDashboardRoutes);
app.use('/api/admin/grades', authMiddleware, roleMiddleware('admin'), adminGradesRoutes);
app.use('/api/admin/reports', authMiddleware, roleMiddleware('admin'), adminReportsRoutes);
app.use('/api/admin/students', authMiddleware, roleMiddleware('admin'), adminStudentsRoutes);

app.use('/api/student/attendance', authMiddleware, roleMiddleware('student'), studentAttendanceRoutes);
app.use('/api/student/dashboard', authMiddleware, roleMiddleware('student'), studentDashboardRoutes);
app.use('/api/student/grades', authMiddleware, roleMiddleware('student'), studentGradesRoutes);
app.use('/api/student/schedule', authMiddleware, roleMiddleware('student'), studentScheduleRoutes);

app.use('/api/teacher/attendance', authMiddleware, roleMiddleware('teacher'), teacherAttendanceRoutes);
app.use('/api/teacher/dashboard', authMiddleware, roleMiddleware('teacher'), teacherDashboardRoutes);
app.use('/api/teacher/grades', authMiddleware, roleMiddleware('teacher'), teacherGradesRoutes);
app.use('/api/teacher/schedule', authMiddleware, roleMiddleware('teacher'), teacherScheduleRoutes);

app.get("/", (req, res) => {
  res.send({ 
    message: "Hello from Simple App (Node)",
    container: HOSTNAME 
    });
});

module.exports = app;
