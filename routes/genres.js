const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Joi = require("joi");

const Genre = new mongoose.model(
  "genre",
  new mongoose.Schema({
    name: { type: String, required: true, minLength: 5, maxLength: 50 },
  })
);

// router.use((req, res, next) => {
//   console.log("request", req.session);
//   if (req?.session?.user) next();
//   else res.send(401);
// });

router.get("/", async (req, res) => {
  const genres = await Genre.find().sort("name");
  res.status(200).send(genres);
});

router.get("/:id", async (req, res) => {
  const genre = await Genre.findById(req.params.id);
  if (!genre)
    return res.status(404).send("The genre with the given ID was not found");
  res.status(200).send(genre);
});

router.post("/", auth, async (req, res) => {
  console.log("req", req);
  const { error } = validateInput(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = new Genre({
    name: req.body.name,
  });
  const result = await genre.save();

  res.status(200).send(result);
});

router.put("/:id", async (req, res) => {
  const { error } = validateInput(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    { new: true }
  );
  if (!genre)
    return res.status(404).send("The genre with the given ID was not found");

  res.status(200).send(genre);
});

router.delete("/:id", [auth, admin], async (req, res) => {
  const genre = await Genre.findByIdAndRemove(req.params.id);
  if (!genre)
    return res.status(404).send("The genre with the given ID was not found");
  res.status(200).send(genre);
});

function validateInput(course) {
  const schema = {
    name: Joi.string().min(3).required(),
  };
  return Joi.validate(course, schema);
}

module.exports = router;
