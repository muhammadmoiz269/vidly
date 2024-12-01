const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { Cart, validateCart, validateDeleteProd } = require("../models/cart");
const auth = require("../middleware/auth");
const { User } = require("../models/users");

router.post("/", auth, async (req, res) => {
  console.log("req.body", req.body);
  const { userId, items } = req.body;
  const { error } = validateCart(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findById(userId);
  if (!user) return res.status(400).send("User not found");

  let cart = await Cart.findOne({ userId: userId });

  if (!cart) {
    cart = new Cart({
      userId,
      items,
    });
  } else {
    items.forEach((item) => {
      const existingItem = cart.items.findIndex(
        (cartItem) => cartItem.productId.toString() === item.productId
      );
      if (existingItem > -1) {
        cart.items[existingItem].quantity = item.quantity;
      } else {
        cart.items.push(item);
      }
    });
  }

  const result = await cart.save();
  res.status(200).send("Item added to cart successfully");
});

router.get("/", auth, async (req, res) => {
  // let cartt = await Cart.findOne({ userId: req.query.id });

  const userId = new mongoose.Types.ObjectId(req.query.id);
  console.log("userId", userId);

  let cart = await Cart.aggregate([
    {
      $match: { userId: userId },
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
            quantity: "$items.quantity",
            productName: "$productDetails.name",
            productDescription: "$productDetails.description",
            productPrice: "$productDetails.price",
          },
        },
      },
    },
  ]);

  console.log("CART --->", cart);

  if (!cart)
    return res.status(404).send("No cart found against the given user id");

  res.status(200).send(cart);
});

router.delete("/", auth, async (req, res) => {
  const { userId, productId } = req.body;

  console.log("userId", userId);
  console.log("prod id", productId);
  const { error } = validateDeleteProd({ userId, productId });

  if (error) return res.status(400).send(error.details[0].message);

  const updatedCart = await Cart.findOneAndUpdate(
    { userId },
    { $pull: { items: { productId: productId } } },
    { new: true }
  );

  const resp = await updatedCart.save();

  if (!updatedCart) {
    return res.status(404).json({ message: "Cart or item not found" });
  }

  res.status(200).send(resp);
});

module.exports = router;
