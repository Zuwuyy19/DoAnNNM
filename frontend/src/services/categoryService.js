// ================================================
// SERVICE: categoryService.js - Các hàm gọi API danh mục
// Mô tả: CRUD danh mục khóa học
// ================================================
import api from "./api";

// ================================================
// FEATURE 21: Lấy danh sách danh mục (Public)
// GET /api/categories
// ================================================
export const getAllCategories = async (params = {}) => {
  return await api.get("/categories", { params });
};

// ================================================
// Lấy 1 danh mục theo slug
// GET /api/categories/:slug
// ================================================
export const getCategoryBySlug = async (slug) => {
  return await api.get(`/categories/${slug}`);
};

// ================================================
// FEATURE 22: Tạo danh mục mới (Admin)
// POST /api/categories
// ================================================
export const createCategory = async (data) => {
  return await api.post("/categories", data);
};

// ================================================
// FEATURE 23: Cập nhật danh mục (Admin)
// PUT /api/categories/:categoryId
// ================================================
export const updateCategory = async (categoryId, data) => {
  return await api.put(`/categories/${categoryId}`, data);
};

// ================================================
// FEATURE 24: Xóa danh mục (Admin)
// DELETE /api/categories/:categoryId
// ================================================
export const deleteCategory = async (categoryId) => {
  return await api.delete(`/categories/${categoryId}`);
};