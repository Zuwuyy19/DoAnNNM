// ================================================
// SERVICE: api.js - Cấu hình Axios cho toàn bộ ứng dụng
// Mô tả: Thiết lập baseURL, interceptors để tự động gắn token,
// xử lý lỗi 401 (token hết hạn), xử lý CORS
// ================================================
import axios from "axios";

// Tạo instance axios với baseURL từ biến môi trường
// VITE_API_URL = http://localhost:5000/api (định nghĩa trong .env)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ================================================
// INTERCEPTOR REQUEST: Tự động gắn token vào header
// Mỗi request gửi đi đều được kiểm tra token trong localStorage
// Nếu có token -> gắn "Authorization: Bearer <token>"
// ================================================
api.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage (đã lưu khi đăng nhập)
    const token = localStorage.getItem("token");

    if (token) {
      // Gắn token vào header Authorization
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config; // Tiếp tục gửi request
  },
  (error) => {
    // Xử lý lỗi trước khi gửi request
    return Promise.reject(error);
  }
);

// ================================================
// INTERCEPTOR RESPONSE: Xử lý response từ server
// 1. Xử lý lỗi 401 (Unauthorized) - Token hết hạn hoặc không hợp lệ
// 2. Chuyển hướng về trang login khi token không hợp lệ
// ================================================
api.interceptors.response.use(
  // Khi response thành công (status 2xx) -> trả về luôn
  (res) => res,

  // Khi có lỗi -> kiểm tra và xử lý
  (err) => {
    // Nếu server trả lỗi 401 (Unauthorized)
    // Tức là token đã hết hạn hoặc không có quyền
    if (err.response?.status === 401) {
      // Xóa token cũ khỏi localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Chuyển hướng về trang login
      window.location.href = "/login";
    }

    // Trả lỗi về cho component gọi xử lý tiếp
    return Promise.reject(err);
  }
);

export default api;
