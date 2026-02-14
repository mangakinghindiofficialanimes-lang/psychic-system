const jwt = require("jsonwebtoken");

module.exports = function(requiredRole) {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ msg: "No token" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).json({ msg: "Access denied" });
      }

      req.admin = decoded;
      next();
    } catch {
      return res.status(401).json({ msg: "Invalid token" });
    }
  };
};