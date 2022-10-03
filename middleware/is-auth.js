const jwt = require("jsonwebtoken");
const API_KEYS = [process.env.api1, process.env.api2, process.env.api3];

exports.isAuthenticated = (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    const error = new Error("Add Authorization Header");
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
  } catch (err) {
    err.statusCode = 500;
    err.message = "Unable to verify token";
    throw err;
  }
  if (!decodedToken) {
    const error = new Error("Not authenticated");
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodedToken.userId;
  next();
};

exports.isAuthorized = (req, res, next) => {
  const apiKey = req.query.apiKey || null;
  if (!API_KEYS.includes(apiKey)) {
    return res.status(401).json({ status: 401, message: "Inavlid api key" });
  }
  next();
};