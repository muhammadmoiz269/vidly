const corsOptions = {
  origin: [
    "http://localhost:4000",
    "http://127.0.0.1:5500",
    "http://localhost:3001",
  ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
  credentials: true,
};

module.exports = corsOptions;
