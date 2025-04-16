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

    // For debugging
    console.log("Processing token:", token.substring(0, 15) + "...");

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error("Token verification error:", err.message);
            return res.status(401).json({ 
                message: "Unauthorized! Invalid token.",
                details: err.message
            });
        }
        
        // Add the decoded user info to the request
        req.user = decoded;
        
        // Log successful token verification (for debugging)
        console.log("Token verified successfully for user:", req.user.id, "role:", req.user.role);
        
        next();
    });
};