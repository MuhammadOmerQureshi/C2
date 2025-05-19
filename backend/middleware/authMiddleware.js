const jwt = require('jsonwebtoken');

// Middleware to protect routes with explicit logging for token issues
const protect = (req, res, next) => {
    const header = req.headers['authorization'];
    const token = req.cookies.jwt || (header && header.split(' ')[1]);

    if (!token) {
        console.error('No token found in cookies or Authorization header');
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            // LOG specific JWT errors
            console.error('JWT error:', err.message);
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
        req.user = decoded;
        next();
    });
};

// Middleware to restrict access based on roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: You do not have access to this resource' });
        }
        next();
    };
};

module.exports = { protect, authorize };
