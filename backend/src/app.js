// ================================================
// EXPRESS APP - Cấu hình ứng dụng backend
// Mô tả: Thiết lập middleware, routes, xử lý lỗi
// ================================================
const express = require("express");
const cors = require("cors");

const app = express();

// ================================================
// CORS: Cho phép frontend truy cập API
// origin: chỉ cho phép domain frontend
// credentials: cho phép gửi cookie/token
// ================================================
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// ================================================
// BODY PARSER: Đọc dữ liệu từ request body (JSON)
// ================================================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ================================================
// STATIC FILES: Phục vụ file tĩnh (uploaded images)
// ================================================
app.use("/uploads", express.static("uploads"));

// ================================================
// ROUTES: Định tuyến các API endpoint
// ================================================

// API xác thực: đăng ký, đăng nhập, profile
const authRoutes = require("./routes/auth.routes");

// API danh mục khóa học
const categoryRoutes = require("./routes/category.routes");

// API khóa học: CRUD, đánh giá, wishlist, thống kê
const courseRoutes = require("./routes/course.routes");

// API đơn hàng: tạo đơn, thanh toán, lịch sử
const orderRoutes = require("./routes/order.routes");

// API mã giảm giá: CRUD coupon
const couponRoutes = require("./routes/coupon.routes");

// API Upload file
const uploadRoutes = require("./routes/upload.routes");

// Gắn prefix /api cho tất cả routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/upload", uploadRoutes);

// ================================================
// API HEALTH CHECK: Kiểm tra server đang chạy
// ================================================
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "🚀 DevMaster API đang hoạt động",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// ================================================
// 404 HANDLER: Xử lý route không tồn tại
// ================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} không tồn tại`,
  });
});

// ================================================
// GLOBAL ERROR HANDLER: Xử lý lỗi server
// ================================================
app.use((err, req, res, next) => {
  console.error("❌ Lỗi server:", err.stack);

  // Lỗi validation MongoDB
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }

  // Lỗi trùng lặp MongoDB (unique constraint)
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Dữ liệu đã tồn tại (trùng lặp)",
      field: Object.keys(err.keyPattern)[0],
    });
  }

  // Lỗi Cast ObjectId không hợp lệ
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "ID không hợp lệ",
    });
  }

  // Lỗi mặc định
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Lỗi server nội bộ. Vui lòng thử lại sau.",
  });
});

module.exports = app;
