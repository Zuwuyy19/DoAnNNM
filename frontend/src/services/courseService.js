// ================================================
// SERVICE: courseService.js - Các hàm gọi API khóa học
// Mô tả: CRUD khóa học, tìm kiếm, lọc, đánh giá, wishlist, thống kê
// ================================================
import api from "./api";

// ================================================
// FEATURE 11: Lấy danh sách khóa học (tìm kiếm, lọc, phân trang)
// GET /api/courses
// Query params: category, level, search, sort, minPrice, maxPrice, featured, page, limit
// ================================================
export const getAllCourses = async (params = {}) => {
  return await api.get("/courses", { params });
};

// ================================================
// FEATURE 12: Lấy chi tiết 1 khóa học theo slug
// GET /api/courses/:slug
// ================================================
export const getCourseBySlug = async (slug) => {
  return await api.get(`/courses/${slug}`);
};

// ================================================
// FEATURE 13: Tạo khóa học mới (Admin / Instructor)
// POST /api/courses
// Body: { title, description, price, category, level, image, ... }
// ================================================
export const createCourse = async (data) => {
  return await api.post("/courses", data);
};

// ================================================
// FEATURE 14: Cập nhật khóa học (Admin / Instructor)
// PUT /api/courses/:courseId
// ================================================
export const updateCourse = async (courseId, data) => {
  return await api.put(`/courses/${courseId}`, data);
};

// ================================================
// FEATURE 15: Xóa khóa học (Admin)
// DELETE /api/courses/:courseId
// ================================================
export const deleteCourse = async (courseId) => {
  return await api.delete(`/courses/${courseId}`);
};

// ================================================
// FEATURE 16: Thêm đánh giá khóa học
// POST /api/courses/:courseId/reviews
// Body: { rating: 1-5, comment: "..." }
// ================================================
export const addReview = async (courseId, data) => {
  return await api.post(`/courses/${courseId}/reviews`, data);
};

// ================================================
// FEATURE 17: Thêm/Xóa khóa học vào Wishlist
// POST /api/courses/:courseId/wishlist?action=add
// POST /api/courses/:courseId/wishlist?action=remove
// ================================================
export const toggleWishlist = async (courseId, action = "add") => {
  return await api.post(`/courses/${courseId}/wishlist?action=${action}`);
};

// ================================================
// FEATURE 18: Lấy thống kê Dashboard (Admin)
// GET /api/courses/admin/stats
// ================================================
export const getDashboardStats = async () => {
  return await api.get("/courses/admin/stats");
};

// ================================================
// FEATURE 19: Lấy danh sách khóa học của Instructor
// GET /api/courses/my/list
// ================================================
export const getMyCourses = async () => {
  return await api.get("/courses/my/list");
};

// ================================================
// FEATURE 20: Lấy khóa học đã đăng ký của User
// GET /api/courses/my/enrolled
// ================================================
export const getMyEnrolledCourses = async () => {
  return await api.get("/courses/my/enrolled");
};