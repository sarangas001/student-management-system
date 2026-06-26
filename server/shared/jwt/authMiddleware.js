const jwtService = require('./jwt.service');

const protect = (roles = []) => {
    return async (req, res, next) => {
        try {
            const { token } = req.cookies;
            if (!token) {
                return res.status(401).json({ success: false, message: 'Not authorized, please login' });
            }

            const decoded = await jwtService.decodeToken(token);
            if (!decoded) {
                return res.status(401).json({ success: false, message: 'Invalid token' });
            }

            if (roles.length && !roles.includes(decoded.role)) {
                return res.status(403).json({ success: false, message: 'Access forbidden: unauthorized role' });
            }

            req.userId = decoded.id;
            req.userRole = decoded.role;
            next();
        } catch (error) {
            return res.status(401).json({ success: false, message: error.message || 'Not authorized' });
        }
    };
};

module.exports = { protect };
