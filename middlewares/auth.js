const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) return res.status(403).json({ message: "No token provided." });

    // Support "Bearer <token>" format.
    const tokenParts = token.split(" ");
    const actualToken = tokenParts.length === 2 ? tokenParts[1] : token;

    jwt.verify(actualToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err)
            return res.status(401).json({ message: "Unauthorized! Invalid token." });
        
        // Assuming the decoded token contains the user ID as 'id'
        req.user = decoded;
        
        // Optionally, you can explicitly pass the user ID if needed
        req.user.id = decoded.id; // Ensure this is the correct field in your JWT payload
        next();
    });
};
