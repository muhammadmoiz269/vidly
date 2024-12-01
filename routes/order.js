const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { validateOrder, Order } = require("../models/order");
const { Cart } = require("../models/cart");
const auth = require("../middleware/auth");
const { Product } = require("../models/products");
const stripe = require("stripe")(
  "sk_test_51K1OxsLJ6MfCVSfKowxaSm9QVXQnBVRhVigFYNVACAXhoEXopiF99UbZu0k3rA9aXxYzMzlubTovFbzdWVQ3uKKP00tFARxFEX"
);

router.post("/", auth, async (req, res) => {
  const { userId } = req.body;
  //   const { error } = validateOrder(req.body);
  //   if (error) return res.status(400).send(error.details[0].message);

  console.log("User Id", userId);
  const cart = await Cart.findOne({ userId: userId });

  console.log("cart is", cart);
  if (!cart || cart?.items?.length === 0) {
    return res.status(400).send("Cart against this user not found or empty.");
  }

  let totalAmount = 0;
  for (const item of cart.items) {
    const product = await Product.findById(item.productId);
    if (!product)
      return res
        .status(400)
        .send(`Product with ID ${item.productId} not found`);
    if (product.stock < item.quantity)
      return res
        .status(400)
        .send(`Not enough stock for product ${product.name}`);
    totalAmount += product.price * item.quantity;
  }

  console.log("Tota amount", totalAmount);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalAmount * 100,
    currency: "usd",
    payment_method_types: ["card"],
  });

  console.log("Payment Intent", paymentIntent);

  const order = new Order({
    userId,
    items: cart.items,
    totalAmount,
    status: "pending",
    paymentId: paymentIntent.id,
    cartId: cart._id,
  });

  console.log("order", order);
  const response = await order.save();

  console.log("Response", response);

  res.status(201).send({
    clientSecret: paymentIntent.client_secret,
    paymentId: paymentIntent.id,
    cartId: cart._id,
    orderId: order._id,
  });
});

router.get("/get-user-order", auth, async (req, res) => {
  const userId = req.query.id;

  let userOrdersObj = {};
  try {
    const userOrders = await Order.find({ userId: userId }).sort({
      created_at: -1,
    });
    if (!userOrders) return res.status(404).send("No orders found");

    const totalAmountSpent = userOrders.reduce((acc, curr) => {
      acc = curr.totalAmount + acc;
      return acc;
    }, 0);

    userOrdersObj = {
      userOrders,
      totalAmountSpent,
    };
    res.status(200).send(userOrdersObj);
  } catch (error) {
    res.status(500).send(`Something went wrong ${error}`);
  }
});

router.get("/get-order", auth, async (req, res) => {
  const orderId = new mongoose.Types.ObjectId(req.query.id);

  try {
    let order = await Order.aggregate([
      {
        $match: { _id: orderId },
      },
      {
        $unwind: "$items",
      },
      {
        $lookup: {
          from: "products", // Name of the product collection
          localField: "items.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $group: {
          _id: "$_id",
          userId: { $first: "$userId" },
          items: {
            $push: {
              productId: "$items.productId",
              productName: "$productDetails.name",
              productDescription: "$productDetails.description",
              productPrice: "$productDetails.price",
              productCategory: "$productDetails.category",
              isReviewed: "$items.isReviewed",
            },
          },
        },
      },
    ]);

    res.status(200).send(order);
  } catch (error) {
    res.status(500).send(`Something went wrong ${error}`);
  }
});

router.post("/add-review", auth, async (req, res) => {
  const { orderId, productId, rating, userId } = req.body;

  const staticComment = "Quality is good";
  const orderUpdateResult = await Order.updateOne(
    { _id: orderId, "items.productId": productId },
    { $set: { "items.$.isReviewed": true } }
  );

  const productUpdateResult = await Product.updateOne(
    {
      _id: productId,
    },

    {
      $push: {
        review: {
          userId,
          rating,
          comment: staticComment,
        },
      },
    }
  );

  res.status(200).send("Review added");
});
module.exports = router;
