const jwt = require("jsonwebtoken");

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("Authorization header:", authHeader);
    return res.status(401).json({ message: "Requires Authorization" }); // No token provided
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" }); // Token invalid or expired
    }

    next(); // Continue to next middleware/route
  });
}

module.exports = {
  verifyJWT,
};