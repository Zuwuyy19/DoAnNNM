// ================================================
// SERVICE: orderService.js - Các hàm gọi API đơn hàng
// Mô tả: Tạo đơn hàng, xem lịch sử, thanh toán, mã giảm giá
// ================================================
import api from "./api";

// ================================================
// FEATURE 25: Tạo đơn hàng mới (mua khóa học)
// POST /api/orders
// Body: { items: [{courseId, price}], couponCode, paymentMethod }
// ================================================
export const createOrder = async (data) => {
  return await api.post("/orders", data);
};

// ================================================
// Áp dụng mã giảm giá (kiểm tra trước khi tạo đơn)
// POST /api/orders/apply-coupon
// Body: { code, courseIds }
// ================================================
export const applyCoupon = async (data) => {
  return await api.post("/orders/apply-coupon", data);
};

// ================================================
// Lấy danh sách đơn hàng của User
// GET /api/orders/my
// ================================================
export const getMyOrders = async () => {
  return await api.get("/orders/my");
};

// ================================================
// Lấy chi tiết đơn hàng
// GET /api/orders/:orderId
// ================================================
export const getOrderById = async (orderId) => {
  return await api.get(`/orders/${orderId}`);
};

// ================================================
// Lấy tất cả đơn hàng (Admin)
// GET /api/orders/admin/all
// ================================================
export const getAllOrders = async (params = {}) => {
  return await api.get("/orders/admin/all", { params });
};

// ================================================
// Cập nhật trạng thái đơn hàng (Admin)
// PATCH /api/orders/:orderId/status
// ================================================
export const updateOrderStatus = async (orderId, data) => {
  return await api.patch(`/orders/${orderId}/status`, data);
};