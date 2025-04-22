const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        return res.status(403).json({ 
            message: "No authorization header provided.",
            details: "Missing Authorization header" 
        });
    }

    // Extract token from "Bearer <token>" format
    const tokenParts = authHeader.split(" ");
    const token = tokenParts.length === 2 ? tokenParts[1] : authHeader;

    jwt.verify(actualToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('Token verification error:', err.message);
            return res.status(401).json({ message: "Unauthorized! Invalid token." });
        }
        
        // Ensure decoded is properly formatted with role and id
        if (!decoded || !decoded.id || !decoded.role) {
            console.error('Invalid token payload:', decoded);
            return res.status(401).json({ message: "Unauthorized! Invalid token payload." });
        }
        
        // Set the complete user object in the request
        req.user = {
            id: decoded.id,
            role: decoded.role
        };
        
        // Log successful authentication
        // console.log(`Authenticated user: ID ${req.user.id}, Role: ${req.user.role}`);
        
        next();
    });
};