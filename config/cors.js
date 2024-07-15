const corsOptions = {
  origin: ["http://localhost:4000", "http://127.0.0.1:5500"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

module.exports = corsOptions;
