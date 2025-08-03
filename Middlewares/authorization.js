const jwt = require("jsonwebtoken");
const { user } = require("../dbConfig");

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

    req.user = decoded; // Attach decoded token to request object
    next(); // Continue to next middleware/route
  });
}

function authorization(req, res, next) {

  const authorizedRoles = {
        "POST /createEvent": ["o"], 
        "PUT /updateEvent/:event_id": ["o"], 
        "DELETE /deleteEvent/:event_id": ["o"], 

        "DELETE /deleteMedication/:id": ["e", "c"],
        "DELETE /deleteMedicalCondition/:id": ["e", "c"],
        "PUT /updateMedication/:id" : ["e", "c"],
        "PUT /updateMedicalCondition/:id": ["e", "c"],
        "POST /createMedication": ["e", "c"],
        "POST /createMedicalCondition": ["e", "c"],

        "POST /addTransactionToAccount": ["e"],
        "PUT /updateExpenditureGoal": ["e"],
        "PUT /updateTransaction/:id": ["e"],
        "DELETE /deleteTransaction/:id": ["e"],

        "PUT /account/password": ["o", "e", "c"]

    };

  const path = req.originalUrl.split("?")[0]; // Remove query string
  const requestedEndpoint = `${req.method} ${path}`;
  const userRole = req.user.role;

  
  console.log("Authorization check");
  console.log("User:", req.user);
  console.log("User role:", userRole);
  console.log("Requested endpoint:", requestedEndpoint);


    const authorizedRole = Object.entries(authorizedRoles).find(
      ([endpoint, roles]) => {
        const regexPattern = endpoint.replace(/:[^/]+/g, "[^/]+");
        const regex = new RegExp(`^${regexPattern}$`); // Create RegExp from endpoint
        return regex.test(requestedEndpoint) && roles.includes(userRole);
      }
    );

    if (!authorizedRole) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
}

module.exports = {
  verifyJWT,
  authorization,
};