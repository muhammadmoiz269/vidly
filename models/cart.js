const mongoose = require("mongoose");
const Joi = require("joi");
const { items } = require("joi/lib/types/array");

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
    unique: true,
  },
  items: [cartItemSchema],
});

const validateCart = (cart) => {
  const cartItemSchema = Joi.object({
    productId: Joi.string().required(),
    quantity: Joi.number().required().min(1),
  });

  const cartSchema = Joi.object({
    userId: Joi.string().required(),
    items: Joi.array().items(cartItemSchema).required(),
  });

  return cartSchema.validate(cart);
};

const Cart = new mongoose.model("cart", cartSchema);

exports.cartItemSchema = cartItemSchema;
exports.cartSchema = cartSchema;
exports.Cart = Cart;
exports.validateCart = validateCart;
