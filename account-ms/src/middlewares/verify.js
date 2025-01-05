const path = require("path");

const jwt = require("jsonwebtoken");

const { createConfig } = require("../config/config");
const { Verify } = require("crypto");

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Unauthorized: Missing JWT Token",
    });
  }

  const token = authHeader.split(" ")[1];
  const configPath = path.join(__dirname, "./config/.env");
  const appConfig = createConfig(configPath);

  jwt.verify(token, appConfig.jwt.access_token, (err, decoded) => {
    if (err) {
      if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
          message: "Unauthorized: Invalid JWT token format",
        });
      } else if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          message: "Unauthorized: Invalid JWT token format",
        });
      } else {
        console.error("JWT verification error: ", err);
        return res.status(500).json({
          message: "Internal Server Error",
        });
      }
    }

    req.user = decoded;
    next();
  });
};

module.exports = verifyJWT;
