const jwt = require('jsonwebtoken');

/**
 * Middleware: decodes the JWT from the httpOnly cookie and attaches
 *   req.user = { id: <mongoId>, role: 'admin' | 'teacher' | 'student' }
 * If the token is missing or invalid, responds with 401.
 */
const protect = (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.id, role: decoded.role };
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};

module.exports = { protect };
