// ✅ CORRECT — replace entire file with this
const jwt = require('jsonwebtoken');

const verifytoken = (req, res, next) => {
  const authHeaders = req.headers.authorization;

  if (!authHeaders || !authHeaders.startsWith("Bearer")) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const token = authHeaders.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("DECODED USER:", req.user);
    next();
  } catch (err) {
    console.error("JWT error:", err.message);
    return res.status(401).json({ message: "Token is not valid" });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  console.log("requireRole — req.user:", req.user);
  console.log("requireRole — allowed roles:", roles);
  console.log("requireRole — user role:", req.user?.role);

  if (!req.user?.role) {
    return res.status(401).json({ message: "Unauthorized - no role found" });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: `Forbidden - role '${req.user.role}' not allowed` });
  }
  next();
};

module.exports = verifytoken;
module.exports.requireRole = requireRole;