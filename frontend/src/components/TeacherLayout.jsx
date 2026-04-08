import { Link, useLocation, useNavigate } from "react-router-dom";
import { getUser, logout } from "../services/authService";
import Icon from "./Icon";
import "../styles/teacher.css";

const menuItems = [
  {
    label: "Tổng quan",
    path: "/teacher",
    icon: "star",
  },
  {
    label: "Khóa học",
    path: "/teacher/courses",
    icon: "bookOpen",
  },
  {
    label: "Hồ sơ cá nhân",
    path: "/profile",
    icon: "user",
  },
];

export default function TeacherLayout({ children, title, subtitle }) {
  const user = getUser();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="teacher-layout">
      <aside className="teacher-sidebar">
        <div className="teacher-sidebar-logo">
          <div className="teacher-logo-icon">GV</div>
          <div>
            <div className="teacher-logo-text">DevMaster</div>
            <div className="teacher-logo-sub">Teacher Studio</div>
          </div>
        </div>

        <nav className="teacher-sidebar-menu">
          <div className="teacher-menu-label">Giảng viên</div>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`teacher-menu-item ${isActive(item.path) ? "active" : ""}`}
            >
              <span className="teacher-menu-icon">
                <Icon name={item.icon} size={16} />
              </span>
              {item.label}
            </Link>
          ))}

          <div className="teacher-menu-label">Điều hướng</div>
          <Link to="/" className="teacher-menu-item">
            <span className="teacher-menu-icon">
              <Icon name="chevronRight" size={16} />
            </span>
            Về trang chủ
          </Link>
        </nav>

        <div className="teacher-sidebar-footer">
          <div className="teacher-user-card">
            <div className="teacher-user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "G"}
            </div>
            <div className="teacher-user-info">
              <div className="teacher-user-name">{user?.name || "Giảng viên"}</div>
              <div className="teacher-user-role">
                {user?.role === "admin" ? "Admin / Teacher" : "Giảng viên"}
              </div>
            </div>
            <button className="teacher-user-btn" onClick={handleLogout} title="Đăng xuất">
              <Icon name="logout" size={16} />
            </button>
          </div>
        </div>
      </aside>

      <main className="teacher-main">
        <header className="teacher-header">
          <div>
            <h1>{title}</h1>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          <div className="teacher-breadcrumb">
            <Link to="/teacher">Teacher</Link>
            <span>/</span>
            <span>{title}</span>
          </div>
        </header>

        <div className="teacher-content">{children}</div>
      </main>
    </div>
  );
}

