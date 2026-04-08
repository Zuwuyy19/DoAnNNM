// ================================================
// COMPONENT: AdminRoute - Bảo vệ route dành cho Admin
// Mô tả: Kiểm tra user đã đăng nhập VÀ có vai trò admin
// Nếu không phải admin -> chuyển về trang chủ
// ================================================
import { Navigate } from "react-router-dom";
import { getUser } from "../services/authService";

const AdminRoute = ({ children }) => {
  // Lấy thông tin user từ localStorage
  const user = getUser();
  const token = localStorage.getItem("token");

  // Chưa đăng nhập -> chuyển về login
  if (!token) {
    return <Navigate to="/login" />;
  }

  // Đã đăng nhập nhưng không phải admin -> chuyển về trang chủ
  if (user && user.role !== "admin") {
    return <Navigate to="/" />;
  }

  // Đã đăng nhập + là admin -> cho phép truy cập
  return children;
};

export default AdminRoute;