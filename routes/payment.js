const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { Order } = require("../models/order");
const { Cart } = require("../models/cart");
const { Product } = require("../models/products");
const stripe = require("stripe")(
  "sk_test_51K1OxsLJ6MfCVSfKowxaSm9QVXQnBVRhVigFYNVACAXhoEXopiF99UbZu0k3rA9aXxYzMzlubTovFbzdWVQ3uKKP00tFARxFEX"
);

router.get("/:id", auth, async (req, res) => {
  const paymentId = req.params.id;
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);

  console.log("paymentIntent", paymentIntent);
  if (!paymentIntent)
    return res.status(400).send("Payment not found of the given id");
  res.status(200).send(paymentIntent);
});

router.post("/confirm", auth, async (req, res) => {
  const orderId = req.body.orderId;
  const order = await Order.findById(orderId);
  if (!order) res.status(400).send("Order not found");

  console.log("order", order);

  const confirmPayment = await stripe.paymentIntents.confirm(order.paymentId, {
    payment_method: "pm_card_visa",
    return_url: "https://www.example.com",
  });

  if (!confirmPayment)
    return res.status(400).send("Payment not found of the given id");

  for (const item of order.items) {
    const product = await Product.findById(item.productId);
    product.stock -= item.quantity;
    await product.save();
  }

  const completedOrder = await Order.findByIdAndUpdate(
    orderId,
    {
      status: "completed",
    },
    { new: true }
  );

  await Cart.findByIdAndDelete(order.cartId);

  console.log("completedOrder", completedOrder);

  const response = `Successfully completed order no ${orderId} with amount ${order.totalAmount}.`;
  res.status(200).send(response);
});

router.post("/process-order", auth, async (req, res) => {
  try {
    const { orderId, paymentIntentId } = req.body;

    // Fetch the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(400).send("Order not found");
    }

    // Validate payment status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent || paymentIntent.status !== "succeeded") {
      return res
        .status(400)
        .send("Payment not successful or invalid Payment Intent ID");
    }

    // Update inventory
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).send(`Product not found: ${item.productId}`);
      }

      if (product.stock < item.quantity) {
        return res
          .status(400)
          .send(`Insufficient stock for product: ${product.name}`);
      }

      product.stock -= item.quantity;
      await product.save();
    }

    // Mark the order as completed
    const completedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status: "completed" },
      { new: true }
    );

    // Clear the cart
    if (order.cartId) {
      await Cart.findByIdAndDelete(order.cartId);
    }

    console.log("Order processed:", completedOrder);

    return res.status(200).send({
      message: `Order ${orderId} processed successfully`,
      order: completedOrder,
    });
  } catch (error) {
    console.error("Error processing order:", error);
    res.status(500).send("An error occurred while processing the order");
  }
});

module.exports = router;
