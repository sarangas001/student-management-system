const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.role || !allowedRoles.includes(req.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. Insufficient permissions.' 
            });
        }
        next();
    };
};

module.exports = roleMiddleware;
