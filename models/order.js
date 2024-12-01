const mongoose = require("mongoose");
const Joi = require("joi");
const { cartItemSchema } = require("./cart");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: "pending",
  },
  paymentId: {
    type: String,
    required: true,
  },
  cartId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "cart",
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const validateOrder = (orderPayload) => {
  const cartItemSchema = Joi.object({
    productId: Joi.string().required(),
    quantity: Joi.number().required().min(1),
  });

  const orderSchema = Joi.object({
    userId: Joi.string().required(),
    items: Joi.array().items(cartItemSchema).required(),
    totalAmount: Joi.number().required(),
    status: Joi.string().required(),
    paymentId: Joi.string().required(),
    cartId: Joi.string().required(),
  });

  return orderSchema.validate(orderPayload);
};

const Order = mongoose.model("order", orderSchema);

exports.orderSchema = orderSchema;
exports.Order = Order;
exports.validateOrder = validateOrder;
