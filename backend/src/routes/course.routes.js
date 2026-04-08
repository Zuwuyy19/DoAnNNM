// ================================================
// ROUTE: course.routes.js - Định tuyến API khóa học
// Mô tả: CRUD khóa học, tìm kiếm, lọc, đánh giá, wishlist
// ================================================
const express = require("express");
const router = express.Router();

const {
  getAllCourses,
  getCourseBySlug,
  createCourse,
  updateCourse,
  deleteCourse,
  addReview,
  toggleWishlist,
  getDashboardStats,
  getMyCourses,
  getMyEnrolledCourses,
} = require("../controllers/course.controller");

// Middleware xác thực
const {
  verifyToken,
  requireAdmin,
  requireInstructor,
  optionalAuth,
} = require("../middlewares/auth.middleware");

// ================================================
// PUBLIC ROUTES - Ai cũng xem được
// ================================================

// FEATURE 11: Lấy danh sách khóa học (tìm kiếm, lọc, phân trang)
// GET /api/courses?category=xxx&level=Beginner&search=react&sort=-price&page=1&limit=12
router.get("/", optionalAuth, getAllCourses);

// FEATURE 12: Lấy chi tiết 1 khóa học theo slug
// GET /api/courses/:slug
router.get("/:slug", getCourseBySlug);

// FEATURE 17: Thêm/Xóa khóa học vào Wishlist
// POST /api/courses/:courseId/wishlist?action=add
// DELETE /api/courses/:courseId/wishlist?action=remove
router.post("/:courseId/wishlist", verifyToken, toggleWishlist);

// ================================================
// PRIVATE ROUTES - Cần đăng nhập
// ================================================

// FEATURE 16: Thêm đánh giá khóa học
// POST /api/courses/:courseId/reviews
router.post("/:courseId/reviews", verifyToken, addReview);

// FEATURE 20: Lấy khóa học đã đăng ký của tôi
// GET /api/courses/my/enrolled
router.get("/my/enrolled", verifyToken, getMyEnrolledCourses);

// ================================================
// INSTRUCTOR/ADMIN ROUTES - Giảng viên hoặc Admin
// ================================================

// FEATURE 13: Tạo khóa học mới
// POST /api/courses
router.post("/", verifyToken, requireInstructor, createCourse);

// FEATURE 19: Lấy danh sách khóa học của tôi (instructor)
// GET /api/courses/my
router.get("/my/list", verifyToken, requireInstructor, getMyCourses);

// FEATURE 14: Cập nhật khóa học
// PUT /api/courses/:courseId
router.put("/:courseId", verifyToken, requireInstructor, updateCourse);

// ================================================
// ADMIN ROUTES - Chỉ Admin
// ================================================

// FEATURE 15: Xóa khóa học
// DELETE /api/courses/:courseId
router.delete("/:courseId", verifyToken, requireAdmin, deleteCourse);

// FEATURE 18: Lấy thống kê Dashboard (Admin)
// GET /api/courses/admin/stats
router.get("/admin/stats", verifyToken, requireAdmin, getDashboardStats);

module.exports = router;

