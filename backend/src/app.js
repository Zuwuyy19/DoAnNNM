// src/app.js

const express = require("express");
const cors = require("cors");

const app = express();

// ✅ Middleware phải đặt trước
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./routes/auth.routes");
app.use("/api/auth", authRoutes);

// Test API
app.get("/", (req, res) => {
  res.send("API is running...");
});

module.exports = app;