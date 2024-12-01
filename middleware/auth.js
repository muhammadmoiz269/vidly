const jwt = require("jsonwebtoken");
const { Token } = require("../models/token");

async function auth(req, res, next) {
  const token = req.header("x-auth-token");

  if (!token) return res.status(401).send("Access denied. No token provided");

  try {
    const decoded = jwt.verify(token, "jwtPrivateKey");
    const tokenEntry = await Token.findOne({ token, userId: decoded._id });

    if (!tokenEntry || tokenEntry.expired) {
      return res
        .status(401)
        .send("Invalid or expired token. Please log in again.");
    }

    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).send("Invalid token");
  }
}

module.exports = auth;
