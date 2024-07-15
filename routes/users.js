const _ = require("lodash");
const asyncMiddleware = require("../middleware/async");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const printHello = require("../middleware/auth");
const express = require("express");
const { User, validateUser } = require("../models/users");
const router = express.Router();

router.get("/me", auth, printHello, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.status(200).send(user);
});

// Wrap all the routes in asyncMiddleware for error handling
// Also you can use express-async-errors package to handle error

router.get(
  "/",
  asyncMiddleware(async (req, res, next) => {
    const result = await User.find().sort("name");
    res.status(200).send(result);
  })
);

router.post("/", async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(404).send("The user already registered");

  user = new User(_.pick(req.body, ["name", "email", "password", "isAdmin"]));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  const result = await user.save();
  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .send(_.pick(result, ["_id", "name", "email", "isAdmin"]));
});

module.exports = router;
