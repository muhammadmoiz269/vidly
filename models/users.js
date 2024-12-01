const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const { type } = require("joi/lib/types/object");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, minLength: 5, maxLength: 50 },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 255,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin, username: this.name },
    "jwtPrivateKey"
  );
  return token;
};

const User = new mongoose.model("user", userSchema);

function validateUser(user) {
  const schema = {
    name: Joi.string().min(1).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
    isAdmin: Joi.boolean().required(),
  };
  return Joi.validate(user, schema);
}

function validateAuth(user) {
  const schema = {
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
  };
  return Joi.validate(user, schema);
}

exports.User = User;
exports.userSchema = userSchema;
exports.validateUser = validateUser;
exports.validateAuth = validateAuth;
