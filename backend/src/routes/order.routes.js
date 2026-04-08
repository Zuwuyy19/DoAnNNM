// ================================================
// ROUTE: order.routes.js - Định tuyến API đơn hàng
// Mô tả: Tạo đơn hàng, xem lịch sử mua, quản lý đơn hàng
// ================================================
const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  applyCoupon,
  vnpayReturn,
  vnpayIPN,
} = require("../controllers/order.controller");

const { verifyToken, requireAdmin } = require("../middlewares/auth.middleware");

// ================================================
// PRIVATE ROUTES - Cần đăng nhập
// ================================================

// FEATURE 25: Tạo đơn hàng mới (mua khóa học)
// POST /api/orders
router.post("/", verifyToken, createOrder);

// Áp dụng mã giảm giá
// POST /api/orders/apply-coupon
router.post("/apply-coupon", verifyToken, applyCoupon);

// Lấy danh sách đơn hàng của tôi
// GET /api/orders/my
router.get("/my", verifyToken, getMyOrders);

// VNPay Callback & IPN
router.get("/vnpay-return", vnpayReturn);
router.get("/vnpay-ipn", vnpayIPN);

// GET /api/orders/:orderId
router.get("/:orderId", verifyToken, getOrderById);

// ================================================
// ADMIN ROUTES
// ================================================

// Lấy tất cả đơn hàng (Admin)
// GET /api/orders/admin/all?page=1&limit=20&paymentStatus=paid
router.get("/admin/all", verifyToken, requireAdmin, getAllOrders);

// Cập nhật trạng thái đơn hàng (Admin)
// PATCH /api/orders/:orderId/status
router.patch("/:orderId/status", verifyToken, requireAdmin, updateOrderStatus);

module.exports = router;
