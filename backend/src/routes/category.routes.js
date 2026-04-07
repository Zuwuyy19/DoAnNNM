// ================================================
// ROUTE: category.routes.js - Định tuyến API danh mục
// Mô tả: CRUD danh mục khóa học
// ================================================
const express = require("express");
const router = express.Router();

const {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryBySlug,
} = require("../controllers/category.controller");

const { verifyToken, requireAdmin } = require("../middlewares/auth.middleware");

// ================================================
// PUBLIC ROUTES - Ai cũng xem được
// ================================================

// FEATURE 21: Lấy danh sách danh mục (kèm số khóa học)
// GET /api/categories?parent=null&search=frontend
router.get("/", getAllCategories);

// Lấy 1 danh mục theo slug
// GET /api/categories/:slug
router.get("/:slug", getCategoryBySlug);

// ================================================
// ADMIN ROUTES - Chỉ Admin
// ================================================

// FEATURE 22: Tạo danh mục mới
// POST /api/categories
router.post("/", verifyToken, requireAdmin, createCategory);

// FEATURE 23: Cập nhật danh mục
// PUT /api/categories/:categoryId
router.put("/:categoryId", verifyToken, requireAdmin, updateCategory);

// FEATURE 24: Xóa danh mục
// DELETE /api/categories/:categoryId
router.delete("/:categoryId", verifyToken, requireAdmin, deleteCategory);

module.exports = router;
