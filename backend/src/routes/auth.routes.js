// ================================================
// ROUTE: auth.routes.js - Định tuyến API xác thực
// Mô tả: Các endpoint liên quan đến đăng nhập, đăng ký, quản lý tài khoản
// ================================================
const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
} = require("../controllers/auth.controller");

// Middleware xác thực
const { verifyToken, requireAdmin } = require("../middlewares/auth.middleware");

// ================================================
// PUBLIC ROUTES - Không cần đăng nhập
// ================================================

// FEATURE 1: Đăng ký tài khoản mới
// POST /api/auth/register
router.post("/register", register);

// FEATURE 2: Đăng nhập
// POST /api/auth/login
router.post("/login", login);

// FEATURE 6: Quên mật khẩu - Gửi yêu cầu reset
// POST /api/auth/forgot-password
router.post("/forgot-password", forgotPassword);

// FEATURE 7: Reset mật khẩu với token
// POST /api/auth/reset-password
router.post("/reset-password", resetPassword);

// ================================================
// PRIVATE ROUTES - Cần đăng nhập (có token hợp lệ)
// ================================================

// FEATURE 3: Lấy thông tin profile người dùng hiện tại
// GET /api/auth/profile
router.get("/profile", verifyToken, getProfile);

// FEATURE 4: Cập nhật thông tin profile
// PUT /api/auth/profile
router.put("/profile", verifyToken, updateProfile);

// FEATURE 5: Đổi mật khẩu
// PUT /api/auth/change-password
router.put("/change-password", verifyToken, changePassword);

// ================================================
// ADMIN ROUTES - Chỉ admin mới được phép
// ================================================

// FEATURE 8: Lấy danh sách tất cả người dùng (có phân trang)
// GET /api/auth/users?page=1&limit=10&role=admin&search=keyword
router.get("/users", verifyToken, requireAdmin, getAllUsers);

// FEATURE 9: Thay đổi vai trò người dùng
// PUT /api/auth/users/:userId/role
router.put("/users/:userId/role", verifyToken, requireAdmin, updateUserRole);

// FEATURE 10: Khóa/Mở tài khoản người dùng
// PATCH /api/auth/users/:userId/status
router.patch("/users/:userId/status", verifyToken, requireAdmin, toggleUserStatus);

module.exports = router;
