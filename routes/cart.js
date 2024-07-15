const express = require("express");
const router = express.Router();
const { Cart, validateCart } = require("../models/cart");
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
        cart.items[existingItem].quantity += item.quantity;
      } else {
        cart.items.push(item);
      }
    });
  }

  const result = await cart.save();
  res.status(200).send("Item added to cart successfully");
});

router.get("/:id", auth, async (req, res) => {
  let cart = await Cart.findOne({ userId: req.params.id });

  if (!cart)
    return res.status(404).send("No cart found against the given user id");

  res.status(200).send(cart);
});
module.exports = router;
