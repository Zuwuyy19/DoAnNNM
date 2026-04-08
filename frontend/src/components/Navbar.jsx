// ================================================
// COMPONENT: Navbar - Thanh điều hướng DÙNG CHUNG
// Mô tả: Navbar thống nhất cho MỌI trang (kể cả Home)
// Active underline animation + cart badge + user dropdown
// ================================================
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getUser, logout } from "../services/authService";
import Icon from "./Icon";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // ================================================
  // Mount: lấy user + cart count từ localStorage
  // ================================================
  useEffect(() => {
    const updateNavbarData = () => {
      const userData = getUser();
      setUser(userData);

      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);
          setCartCount(Array.isArray(parsed) ? parsed.length : 0);
        } catch {
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }
    };

    updateNavbarData();
    // Lắng nghe sự kiện thêm giỏ hàng (same-tab và cross-tab)
    window.addEventListener("cartUpdated", updateNavbarData);
    window.addEventListener("storage", updateNavbarData);

    return () => {
      window.removeEventListener("cartUpdated", updateNavbarData);
      window.removeEventListener("storage", updateNavbarData);
    };
  }, [location.pathname]);

  // ================================================
  // Kiểm tra link active theo route hiện tại
  // ================================================
  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  // ================================================
  // Xử lý đăng xuất
  // ================================================
  const handleLogout = () => {
    logout();
    setUser(null);
    setDropdownOpen(false);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* ===== LOGO ===== */}
        <Link to="/" className="navbar-logo">
          <img src="/logo-codenova.svg" alt="Courses" className="navbar-logo-image" />
        </Link>

        {/* ===== MENU ĐIỀU HƯỚNG ===== */}
        <div className="navbar-links">
          <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
            Trang Chủ
          </Link>
          <Link to="/courses" className={`nav-link ${isActive("/courses") ? "active" : ""}`}>
            Khóa Học
          </Link>
          {user && (
            <>
              {/* Menu cho Học viên */}
              {user.role === "student" && (
                <Link to="/my-learning" className={`nav-link ${isActive("/my-learning") ? "active" : ""}`}>
                  Học Tập
                </Link>
              )}

              {/* Menu cho Giảng viên */}
              {user.role === "instructor" && (
                <Link to="/my-teaching" className={`nav-link ${isActive("/my-teaching") ? "active" : ""}`}>
                  Giảng Dạy
                </Link>
              )}

              {/* Menu cho Admin */}
              {user.role === "admin" && (
                <Link to="/admin" className={`nav-link ${isActive("/admin") ? "active" : ""}`}>
                  Quản Trị
                </Link>
              )}

              <Link to="/my-orders" className={`nav-link ${isActive("/my-orders") ? "active" : ""}`}>
                Đơn Hàng
              </Link>
            </>
          )}
          {user?.role === "admin" && (
            <Link to="/admin" className="nav-link nav-link-admin">
              Quản Trị
            </Link>
          )}
        </div>

        {/* ===== ACTIONS BÊN PHẢI ===== */}
        <div className="navbar-actions">
          {!user ? (
            <>
              {/* Nút Giỏ hàng với badge số lượng */}
              <button
                className="cart-btn cart-btn-icon-only"
                onClick={() => navigate("/checkout")}
                title="Giỏ hàng"
                aria-label="Giỏ hàng"
              >
                <Icon name="cart" size={18} />
                {cartCount > 0 && (
                  <span className="cart-badge">{cartCount}</span>
                )}
              </button>

              <Link to="/login" className="btn btn-outline btn-sm">
                Đăng Nhập
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Đăng Ký
              </Link>
            </>
          ) : (
            /* Đã đăng nhập: avatar + icon giỏ hàng kế bên */
            <div className="user-actions-group">
              <button
                className="cart-btn cart-btn-icon-only"
                onClick={() => navigate("/checkout")}
                title="Giỏ hàng"
                aria-label="Giỏ hàng"
              >
                <Icon name="cart" size={18} />
                {cartCount > 0 && (
                  <span className="cart-badge">{cartCount}</span>
                )}
              </button>

              <div className="user-dropdown">
                <button
                  className="user-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <div className="user-avatar">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} />
                    ) : (
                      <span>{user.name?.charAt(0)?.toUpperCase()}</span>
                    )}
                  </div>
                  <span className="user-name">{user.name}</span>
                  <span className="dropdown-arrow" aria-hidden>
                    <Icon name="chevronDown" size={16} />
                  </span>
                </button>

                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <strong>{user.name}</strong>
                      <span className="user-email">{user.email}</span>
                      <span className={`role-badge role-${user.role}`}>
                        {user.role === "admin" ? "Quản trị viên" : user.role === "instructor" ? "Giảng viên" : "Học viên"}
                      </span>
                    </div>

                    <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <span style={{ display: "inline-flex", alignItems: "center" }}><Icon name="user" size={16} /></span>
                      Hồ sơ cá nhân
                    </Link>
                    <Link to="/wishlist" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <span style={{ display: "inline-flex", alignItems: "center" }}><Icon name="heart" size={16} /></span>
                      Yêu thích
                    </Link>
                    <Link to="/my-learning" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <span style={{ display: "inline-flex", alignItems: "center" }}><Icon name="star" size={16} /></span>
                      Khóa học của tôi
                    </Link>
                    <Link to="/my-orders" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <span style={{ display: "inline-flex", alignItems: "center" }}><Icon name="clock" size={16} /></span>
                      Đơn hàng
                    </Link>

                    {user.role === "admin" && (
                      <Link to="/admin" className="dropdown-item dropdown-admin" onClick={() => setDropdownOpen(false)}>
                        <span style={{ display: "inline-flex", alignItems: "center" }}><Icon name="settings" size={16} /></span>
                        Trang quản trị
                      </Link>
                    )}

                    <div className="dropdown-divider" />

                    <button className="dropdown-item logout-item" onClick={handleLogout}>
                      <span style={{ display: "inline-flex", alignItems: "center" }}><Icon name="logout" size={16} /></span>
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Hamburger mobile */}
          <button className="hamburger" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;