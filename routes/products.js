const express = require("express");
const router = express.Router();
const {
  Product,
  validateProduct,
  validateReview,
} = require("../models/products");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { User } = require("../models/users");

router.post("/", [auth, admin], async (req, res) => {
  console.log("req.body", req.body);
  const { name, description, price, category, stock } = req.body;
  const { error } = validateProduct(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const prod = new Product({
    name,
    description,
    price,
    category,
    stock,
  });

  const result = await prod.save();
  res.status(200).send(result);
});

router.post("/:id/review", auth, async (req, res) => {
  try {
    const productId = req.params.id;

    const reviewPayload = {
      userId: req.user._id,
      ...req.body,
    };

    console.log("req.user", req.user);
    console.log("review payload", reviewPayload);

    const product = await Product.findById(productId);
    if (!product) return res.status(404).send("Product not found");

    const { error } = validateReview(reviewPayload);
    if (error) return res.status(400).send(error.details[0].message);

    product.review.push(reviewPayload);
    const updatedProd = await product.save();

    res.status(200).send(updatedProd);
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
});

router.get("/", async (req, res) => {
  const result = await Product.find();
  res.status(200).send(result);
});

router.get("/top-rated/:rating", auth, async (req, res) => {
  try {
    const rating = Number(req.params.rating);

    const result = await Product.aggregate([
      {
        $addFields: {
          averageRating: { $avg: "$review.rating" },
        },
      },
      {
        $match: {
          averageRating: { $gte: rating },
        },
      },
      {
        $sort: { averageRating: -1 },
      },
    ]);

    res.status(200).send(result);
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
});

router.get("/search", auth, async (req, res) => {
  const { name, subcategory, range, limit = 2, page = 1 } = req.query;
  console.log("name", name, subcategory);

  try {
    const query = {
      $or: [],
    };
    if (name) {
      query.$or.push({ name: { $regex: name, $options: "i" } });
    }
    if (subcategory) {
      query.$or.push({
        category: {
          $elemMatch: { $regex: subcategory, $options: "i" },
        },
      });
    }
    if (range) {
      query.$or.push({
        price: { $lte: parseFloat(range) },
      });
    }

    const prod = await Product.find(query)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort("stock");

    if (!prod) res.status(400).send("No product found");

    res.status(200).json(prod);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.put("/:id", [auth, admin], async (req, res) => {
  const { error } = validateProduct(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const prod = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
    },
    { new: true }
  );
  if (!prod)
    return res.status(404).send("The product with the given ID was not found");

  res.status(200).send(prod);
});

router.delete("/:id", [auth, admin], async (req, res) => {
  const prod = await Product.findByIdAndRemove(req.params.id);
  if (!prod)
    return res.status(404).send("The product with the given id was not found");
  res.status(200).send(prod);
});

module.exports = router;
