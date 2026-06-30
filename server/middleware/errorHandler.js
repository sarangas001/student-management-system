const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    logger.error(`${err.name}: ${err.message}`, {
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip,
    });

    const status = err.status || err.statusCode || 500;

    if (process.env.NODE_ENV === 'production') {
        return res.status(status).json({
            success: false,
            message: status >= 500 ? 'Internal server error' : err.message,
        });
    }

    return res.status(status).json({
        success: false,
        message: err.message,
        stack: err.stack,
    });
};

const notFound = (req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
};

module.exports = { errorHandler, notFound };
