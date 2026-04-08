// ================================================
// COMPONENT: AdminLayout - Layout chung cho trang Admin
// Mô tả: Sidebar điều hướng + Main content area
// Hiển thị menu quản trị, thông tin user đang đăng nhập
// ================================================
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getUser, logout } from "../services/authService";
import Icon from "./Icon";
import "../styles/admin.css";

export default function AdminLayout({ children, title, subtitle }) {
  // ================================================
  // Lấy thông tin user từ localStorage
  // ================================================
  const user = getUser();
  const location = useLocation();
  const navigate = useNavigate();

  // ================================================
  // Xử lý đăng xuất: xóa token, chuyển về login
  // ================================================
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ================================================
  // Kiểm tra menu item có active không
  // ================================================
  const isActive = (path) => location.pathname === path;

  return (
    <div className="admin-layout">
      {/* ==================== SIDEBAR ==================== */}
      <aside className="admin-sidebar">
        {/* Logo & Thương hiệu */}
        <div className="admin-sidebar-logo">
          <div className="logo-icon">DM</div>
          <div>
            <div className="logo-text">DevMaster</div>
            <div className="logo-sub">Admin Panel</div>
          </div>
        </div>

        {/* Menu điều hướng chính */}
        <nav className="admin-sidebar-menu">
          {/* Nhãn: Tổng quan */}
          <div className="admin-menu-label">Tổng quan</div>

          {/* Dashboard - Trang tổng quan */}
          <Link
            to="/admin"
            className={`admin-menu-item ${isActive("/admin") ? "active" : ""}`}
          >
            <span className="menu-icon"><Icon name="star" size={16} /></span>
            Dashboard
          </Link>

          {/* Nhãn: Quản lý */}
          <div className="admin-menu-label">Quản lý</div>

          {/* Quản lý khóa học */}
          <Link
            to="/admin/courses"
            className={`admin-menu-item ${isActive("/admin/courses") ? "active" : ""}`}
          >
            <span className="menu-icon"><Icon name="star" size={16} /></span>
            Khóa học
          </Link>

          {/* Quản lý danh mục */}
          <Link
            to="/admin/categories"
            className={`admin-menu-item ${isActive("/admin/categories") ? "active" : ""}`}
          >
            <span className="menu-icon"><Icon name="settings" size={16} /></span>
            Danh mục
          </Link>

          {/* Quản lý đơn hàng */}
          <Link
            to="/admin/orders"
            className={`admin-menu-item ${isActive("/admin/orders") ? "active" : ""}`}
          >
            <span className="menu-icon"><Icon name="clock" size={16} /></span>
            Đơn hàng
          </Link>

          {/* Quản lý người dùng */}
          <Link
            to="/admin/users"
            className={`admin-menu-item ${isActive("/admin/users") ? "active" : ""}`}
          >
            <span className="menu-icon"><Icon name="users" size={16} /></span>
            Người dùng
          </Link>

          {/* Quản lý mã giảm giá */}
          <Link
            to="/admin/coupons"
            className={`admin-menu-item ${isActive("/admin/coupons") ? "active" : ""}`}
          >
            <span className="menu-icon"><Icon name="settings" size={16} /></span>
            Mã giảm giá
          </Link>

          {/* Nhãn: Tài khoản */}
          <div className="admin-menu-label">Tài khoản</div>

          {/* Hồ sơ cá nhân */}
          <Link
            to="/profile"
            className="admin-menu-item"
          >
            <span className="menu-icon"><Icon name="user" size={16} /></span>
            Hồ sơ cá nhân
          </Link>

          {/* Quay về trang chủ */}
          <Link to="/" className="admin-menu-item">
            <span className="menu-icon"><Icon name="chevronRight" size={16} /></span>
            Quay về trang chủ
          </Link>
        </nav>

        {/* Thông tin user + Đăng xuất ở cuối sidebar */}
        <div className="admin-sidebar-footer">
          <div className="admin-user-card">
            {/* Avatar: chữ cái đầu của tên */}
            <div className="admin-user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>

            {/* Tên & vai trò */}
            <div className="admin-user-info">
              <div className="admin-user-name">{user?.name || "Admin"}</div>
              <div className="admin-user-role">
                {user?.role === "admin" ? "Quản trị viên" : "Người dùng"}
              </div>
            </div>

            {/* Nút đăng xuất */}
            <button className="admin-user-btn" onClick={handleLogout} title="Đăng xuất">
              <Icon name="logout" size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ==================== MAIN CONTENT ==================== */}
      <main className="admin-main">
        {/* Header của trang */}
        <header className="admin-header">
          <div className="admin-header-left">
            {/* Tiêu đề trang */}
            <h1>{title}</h1>
            {/* Mô tả ngắn */}
            {subtitle && <p>{subtitle}</p>}
          </div>

          <div className="admin-header-right">
            {/* Breadcrumb */}
            <div className="admin-breadcrumb">
              <Link to="/admin">Admin</Link>
              <span>/</span>
              <span>{title}</span>
            </div>
          </div>
        </header>

        {/* Nội dung chính của trang */}
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
}
