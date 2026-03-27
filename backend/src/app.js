// src/app.js

const express = require("express");
const cors = require("cors");

const app = express();

// ✅ Middleware phải đặt trước
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./routes/auth.routes");
const categoryRoutes = require("./routes/category.routes");
const courseRoutes = require("./routes/course.routes");

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/courses", courseRoutes);

// Test API
app.get("/", (req, res) => {
  res.send("API is running...");
});

module.exports = app;