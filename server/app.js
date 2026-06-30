require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const mongoose = require('mongoose');
const os = require('os');

const logger = require('./utils/logger');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { protect } = require('./shared/authMiddleware');
const { requireRole } = require('./middleware/authorize');

const HOSTNAME = process.env.HOSTNAME || os.hostname();

const app = express();

// ── Security headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',');
app.use(cors({
    origin: [allowedOrigins, "http://localhost"],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Request parsing ───────────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// ── NoSQL injection sanitisation ──────────────────────────────────────────────
// express-mongo-sanitize is incompatible with Express 5 (req.query is a
// read-only getter in Express 5). This inline replacement achieves the same
// effect by recursively stripping keys that start with '$' or contain '.'
// from req.body and req.params, which are the injection attack surfaces.
app.use((req, _res, next) => {
    const strip = (obj) => {
        if (!obj || typeof obj !== 'object') return;
        for (const key of Object.keys(obj)) {
            if (key.startsWith('$') || key.includes('.')) {
                delete obj[key];
            } else {
                strip(obj[key]);
            }
        }
    };
    strip(req.body);
    strip(req.params);
    next();
});

// ── Compression ───────────────────────────────────────────────────────────────
app.use(compression());

// ── HTTP request logging ──────────────────────────────────────────────────────
app.use(morgan('combined', { stream: { write: (msg) => logger.http(msg.trim()) } }));

// ── Rate limiting ─────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many login attempts, please try again later.' },
    skipSuccessfulRequests: true,
});

app.use(globalLimiter);

// ── Health & observability endpoints ─────────────────────────────────────────
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        hostname: HOSTNAME,
    });
});

app.get('/ready', (req, res) => {
    const dbState = mongoose.connection.readyState;
    if (dbState === 1) {
        return res.status(200).json({ status: 'ready', db: 'connected' });
    }
    const stateMap = { 0: 'disconnected', 2: 'connecting', 3: 'disconnecting' };
    return res.status(503).json({ status: 'not ready', db: stateMap[dbState] || 'unknown' });
});

app.get('/metrics', (req, res) => {
    const mem = process.memoryUsage();
    res.status(200).json({
        uptime: process.uptime(),
        memory: { rss: mem.rss, heapUsed: mem.heapUsed, heapTotal: mem.heapTotal, external: mem.external },
        db: { readyState: mongoose.connection.readyState, host: mongoose.connection.host, name: mongoose.connection.name },
    });
});

// ── Route imports ─────────────────────────────────────────────────────────────
const authRoutes              = require('./routes/auth.routes');
const studentRoutes           = require('./routes/studentRoutes');
const adminRoutes             = require('./routes/adminRoutes');
const teacherRoutes           = require('./routes/teacherRoutes');
const aiAssistentRoutes       = require('./routes/aiAssistentRoutes');
const adminAttendanceRoutes   = require('./routes/adminAttendanceRoutes');
const adminCoursesRoutes      = require('./routes/adminCoursesRoutes');
const adminDashboardRoutes    = require('./routes/adminDashboardRoutes');
const adminGradesRoutes       = require('./routes/adminGradesRoutes');
const adminReportsRoutes      = require('./routes/adminReportsRoutes');
const adminStudentsRoutes     = require('./routes/adminStudentsRoutes');
const studentAttendanceRoutes = require('./routes/studentAttendanceRoutes');
const studentDashboardRoutes  = require('./routes/studentDashboardRoutes');
const studentGradesRoutes     = require('./routes/studentGradesRoutes');
const studentScheduleRoutes   = require('./routes/studentScheduleRoutes');
const teacherAttendanceRoutes = require('./routes/teacherAttendanceRoutes');
const teacherDashboardRoutes  = require('./routes/teacherDashboardRoutes');
const teacherGradesRoutes     = require('./routes/teacherGradesRoutes');
const teacherScheduleRoutes   = require('./routes/teacherScheduleRoutes');

// ── Public routes ─────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);

// ── Protected routes — require valid JWT + correct role ───────────────────────
// Admin — full platform management
app.use('/api/admins',           protect, requireRole('admin'), adminRoutes);
app.use('/api/admin/attendance', protect, requireRole('admin'), adminAttendanceRoutes);
app.use('/api/admin/courses',    protect, requireRole('admin'), adminCoursesRoutes);
app.use('/api/admin/dashboard',  protect, requireRole('admin'), adminDashboardRoutes);
app.use('/api/admin/grades',     protect, requireRole('admin'), adminGradesRoutes);
app.use('/api/admin/reports',    protect, requireRole('admin'), adminReportsRoutes);
app.use('/api/admin/students',   protect, requireRole('admin'), adminStudentsRoutes);

// Students resource — admin manages, students read own data
app.use('/api/students',              protect, requireRole('admin'), studentRoutes);
app.use('/api/student/attendance',    protect, requireRole('student'), studentAttendanceRoutes);
app.use('/api/student/dashboard',     protect, requireRole('student'), studentDashboardRoutes);
app.use('/api/student/grades',        protect, requireRole('student'), studentGradesRoutes);
app.use('/api/student/schedule',      protect, requireRole('student'), studentScheduleRoutes);

// Teachers resource — admin manages, teachers act on own data
app.use('/api/teachers',              protect, requireRole('admin'), teacherRoutes);
app.use('/api/teacher/attendance',    protect, requireRole('teacher'), teacherAttendanceRoutes);
app.use('/api/teacher/dashboard',     protect, requireRole('teacher'), teacherDashboardRoutes);
app.use('/api/teacher/grades',        protect, requireRole('teacher'), teacherGradesRoutes);
app.use('/api/teacher/schedule',      protect, requireRole('teacher'), teacherScheduleRoutes);

// AI assistant — all authenticated roles
app.use('/api/ai-assistent', protect, aiAssistentRoutes);

// Root info
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Student Management System API', version: '1.0.0', container: HOSTNAME });
});

// ── 404 & global error handler (must be last) ─────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
