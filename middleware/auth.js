const jwt = require("jsonwebtoken");

/**
 * Middleware to verify JWT token from the request
 * Token should be provided in the Authorization header as "Bearer [token]"
 */
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access denied. No token provided or invalid format.",
      });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token." });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired." });
    }
    res
      .status(500)
      .json({ message: "Internal server error during authentication." });
  }
};

module.exports = { verifyToken };
