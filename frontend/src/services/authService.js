// ================================================
// SERVICE: authService.js - Các hàm gọi API xác thực
// Mô tả: Đăng nhập, đăng ký, quản lý token, profile, đổi mật khẩu
// ================================================
import api from "./api";

// ================================================
// Lưu token vào localStorage
// Key: "token" - Lưu JWT token nhận được từ server
// ================================================
export const saveToken = (token) => {
  localStorage.setItem("token", token);
};

// ================================================
// Lấy token từ localStorage
// Trả về: string token hoặc null
// ================================================
export const getToken = () => {
  return localStorage.getItem("token");
};

// ================================================
// Lưu thông tin user vào localStorage
// Lưu dưới dạng JSON string (key: "user")
// ================================================
export const saveUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

// ================================================
// Lấy thông tin user từ localStorage
// Trả về: object user hoặc null
// ================================================
export const getUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

// ================================================
// Xóa token và user (đăng xuất)
// ================================================
export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// ================================================
// FEATURE 1: Đăng ký tài khoản mới
// POST /api/auth/register
// Body: { name, email, password }
// ================================================
export const register = async (data) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

// ================================================
// FEATURE 2: Đăng nhập
// POST /api/auth/login
// Body: { email, password }
// Response: { token, user: { id, name, email, role } }
// ================================================
export const login = async (data) => {
  const res = await api.post("/auth/login", data);

  // Lưu token và user vào localStorage khi đăng nhập thành công
  if (res.data.token) {
    saveToken(res.data.token);
    saveUser(res.data.user);
  }

  return res.data;
};

// ================================================
// FEATURE 3: Lấy thông tin Profile người dùng
// GET /api/auth/profile
// Header: Authorization: Bearer <token>
// ================================================
export const getProfile = async () => {
  return await api.get("/auth/profile");
};

// ================================================
// FEATURE 4: Cập nhật thông tin Profile
// PUT /api/auth/profile
// Body: { name, avatar, phone, bio }
// ================================================
export const updateProfile = async (data) => {
  return await api.put("/auth/profile", data);
};

// ================================================
// FEATURE 5: Đổi mật khẩu
// PUT /api/auth/change-password
// Body: { currentPassword, newPassword }
// ================================================
export const changePassword = async (data) => {
  return await api.put("/auth/change-password", data);
};

// ================================================
// FEATURE 6: Quên mật khẩu
// POST /api/auth/forgot-password
// Body: { email }
// ================================================
export const forgotPassword = async (email) => {
  return await api.post("/auth/forgot-password", { email });
};

// ================================================
// FEATURE 7: Reset mật khẩu với token
// POST /api/auth/reset-password
// Body: { token, newPassword }
// ================================================
export const resetPassword = async (data) => {
  return await api.post("/auth/reset-password", data);
};

// ================================================
// FEATURE 8: Lấy danh sách tất cả người dùng (Admin)
// GET /api/auth/users?page=1&limit=10&role=xxx&search=xxx
// ================================================
export const getAllUsers = async (params = {}) => {
  return await api.get("/auth/users", { params });
};

// ================================================
// FEATURE 9: Thay đổi vai trò người dùng (Admin)
// PUT /api/auth/users/:userId/role
// Body: { role: "admin" | "instructor" | "user" }
// ================================================
export const updateUserRole = async (userId, role) => {
  return await api.put(`/auth/users/${userId}/role`, { role });
};

// ================================================
// FEATURE 10: Khóa/Mở tài khoản (Admin)
// PATCH /api/auth/users/:userId/status
// ================================================
export const toggleUserStatus = async (userId) => {
  return await api.patch(`/auth/users/${userId}/status`);
};

// ================================================
// Đăng xuất: Xóa token và chuyển về login
// ================================================
export const logout = () => {
  clearAuth();
  window.location.href = "/login";
};
