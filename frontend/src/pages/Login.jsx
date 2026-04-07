// ================================================
// PAGE: Login - Trang đăng nhập
// Mô tả: Form đăng nhập với email và mật khẩu
// FEATURE 2: Đăng nhập người dùng
// ================================================
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import Icon from "../components/Icon";
import "../styles/auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ================================================
  // Xử lý submit form đăng nhập
  // ================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await login({ email, password });

      if (data.success) {
        if (data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } else {
        setError(data.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      const message = err.response?.data?.message || "Không thể kết nối server";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Card form đăng nhập */}
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <h2 style={{ display: "inline-flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
            <span style={{ width: 28, height: 28, borderRadius: 10, background: "var(--gradient-primary)", color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 12 }}>
              DM
            </span>
            DevMaster
          </h2>
          <p>Chào mừng bạn quay trở lại</p>
        </div>

        {/* Thông báo lỗi */}
        {error && (
          <div className="message-box error" style={{ textAlign: "left" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <Icon name="lock" size={16} />
              {error}
            </span>
          </div>
        )}

        {/* Form đăng nhập */}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {/* Nút đăng nhập */}
          <button
            type="submit"
            className="btn btn-primary auth-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Đang đăng nhập...
              </>
            ) : (
              "Đăng nhập"
            )}
          </button>
        </form>

        {/* Link đăng ký */}
        <p className="auth-footer">
          Chưa có tài khoản?{" "}
          <Link to="/register">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
}