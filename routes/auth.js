const config = require("config");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const { User, validateAuth } = require("../models/users");
const { Token } = require("../models/token");

router.post("/", async (req, res) => {
  const { error } = validateAuth(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("The email or password is incorrect");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword)
    return res.status(400).send("The email or password is incorrect");

  // Invalidate any existing tokens for this user
  await Token.updateMany(
    { userId: user._id, expired: false },
    { $set: { expired: true } }
  );

  console.log("----> user", user);
  const token = user.generateAuthToken();
  // const token = jwt.sign({_id:user._id}, config.get('jwtPrivateKey'))
  console.log("token", token);

  // Store the token in the database
  const tokenEntry = new Token({ token, userId: user._id });
  await tokenEntry.save();

  const userPayload = {
    ...user,
    token,
  };

  if (token) {
    res.status(200).send({ userPayload });
    // if (req.session.user) {
    //   res.status(200).send(req.session.user);
    // } else {
    //   req.session.user = {
    //     email: req.body.email,
    //   };
    //   res.status(200).send(req.session);
    // }
  }

  //   res.status(200).send(token);
});

router.post("/logout", async (req, res) => {
  const token = req.header("x-auth-token");
  await Token.findOneAndRemove({ token });
  res.status(200).send("Logged out successfully");
});

module.exports = router;
