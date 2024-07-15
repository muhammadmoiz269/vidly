const config = require("config");
const error = require("./middleware/error");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const session = require("express-session");
const cors = require("cors");
const app = express();
const corsOptions = require("./config/cors");

const genre = require("./routes/genres");
const customer = require("./routes/customer");
const courses = require("./routes/courses");
const rental = require("./routes/rental");
const user = require("./routes/users");
const auth = require("./routes/auth");
const product = require("./routes/products");
const addToCart = require("./routes/cart");
const checkout = require("./routes/order");
const payment = require("./routes/payment");

const port = process.env.PORT || 3000;

app.use(cors(corsOptions));

// if(!config.get('jwtPrivateKey')){
//     console.log('FATAL ERROR: jwtPrivateKey is not defined')
//     process.exit(1)
// }

mongoose
  .connect("mongodb://localhost:27017/vidly")
  .then(() => console.log("connected"))
  .catch((err) => console.log(err));

// app.use(
//   session({
//     secret: "mySecretKey123!@#", // Change this to a secure secret
//     resave: false,
//     saveUninitialized: true,
//   })
// );
app.use(express.json());
app.use("/api/product", product);
app.use("/api/addToCart", addToCart);
app.use("/api/checkout", checkout);
app.use("/api/payment", payment);
app.use("/api/genre", genre);
app.use("/api/customer", customer);
app.use("/api/course", courses);
app.use("/api/rental", rental);
app.use("/api/user", user);
app.use("/api/auth", auth);
// app.use(error)

app.listen(port, () => console.log(`Listening on port ${port}...`));
