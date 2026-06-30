const app = require('./app');
const mongoose = require('mongoose');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3001;

const connectDB = async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        logger.error('MONGO_URI is not set. Check your .env file.');
        process.exit(1);
    }
    await mongoose.connect(uri);
    logger.info(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
};

const startServer = async () => {
    await connectDB();

    const server = app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    });

    // ── Graceful shutdown ─────────────────────────────────────────────────────
    const shutdown = async (signal) => {
        logger.info(`${signal} received — shutting down gracefully`);
        server.close(async () => {
            logger.info('HTTP server closed');
            await mongoose.connection.close();
            logger.info('MongoDB connection closed');
            process.exit(0);
        });

        // Force exit if graceful shutdown takes too long
        setTimeout(() => {
            logger.error('Graceful shutdown timed out — forcing exit');
            process.exit(1);
        }, 10_000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));

    // ── Unhandled rejections / exceptions ────────────────────────────────────
    process.on('unhandledRejection', (reason) => {
        logger.error('Unhandled Promise Rejection', { reason });
        shutdown('unhandledRejection');
    });

    process.on('uncaughtException', (err) => {
        logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
        shutdown('uncaughtException');
    });
};

startServer().catch((err) => {
    logger.error('Failed to start server', { error: err.message });
    process.exit(1);
});
