const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // CHECK TOKEN EXISTS
    if (!authHeader) {
      return res.status(401).json({
        status: false,
        message: "Token missing",
      });
    }

    // FORMAT: Bearer TOKEN
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        status: false,
        message: "Invalid token format",
      });
    }

    // VERIFY TOKEN
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // STORE USER DATA
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = verifyToken;