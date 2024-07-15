const mongoose = require("mongoose");
const Joi = require("joi");

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, minLength: 5, maxLength: 50 },
  description: { type: String, required: false, minLength: 0, maxLength: 250 },
  price: { type: Number, required: true, min: 0 },
  category: { type: [String] },
  created_at: { type: Date, required: true, default: Date.now },
  stock: { type: Number, required: true, min: 0 },
  review: [reviewSchema],
});

const Product = new mongoose.model("product", productSchema);

function validateProduct(product) {
  const schema = {
    name: Joi.string().min(5).max(50).required(),
    description: Joi.string().max(255),
    price: Joi.number(),
    category: Joi.array().items(Joi.string()),
    stock: Joi.number(),
  };
  return Joi.validate(product, schema);
}

function validateReview(payload) {
  const schema = {
    userId: Joi.objectId().required(),
    comment: Joi.string().max(255).required(),
    rating: Joi.number().min(1).max(5).required(),
  };
  return Joi.validate(payload, schema);
}

exports.Product = Product;
exports.productSchema = productSchema;
exports.validateProduct = validateProduct;
exports.validateReview = validateReview;
