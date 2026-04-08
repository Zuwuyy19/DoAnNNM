// ================================================
// PAGE: Register - Trang đăng ký tài khoản mới
// Mô tả: Form đăng ký với name, email, password
// FEATURE 1: Đăng ký tài khoản người dùng
// ================================================
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/authService";
import Icon from "../components/Icon";
import "../styles/auth.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  // ================================================
  // Xử lý submit form đăng ký
  // ================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      setMessage({ type: "error", text: "Vui lòng nhập đầy đủ thông tin" });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Mật khẩu xác nhận không khớp" });
      return;
    }

    if (password.length < 6) {
      setMessage({ type: "error", text: "Mật khẩu phải có ít nhất 6 ký tự" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await register({ name, email, password });

      if (res.success) {
        setMessage({
          type: "success",
          text: "Đăng ký thành công! Đang chuyển sang đăng nhập...",
        });
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMessage({ type: "error", text: res.message || "Đăng ký thất bại" });
      }
    } catch (err) {
      const errorText = err.response?.data?.message || "Không thể kết nối server";
      setMessage({ type: "error", text: errorText });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Card form đăng ký */}
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <h2 style={{ display: "inline-flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
            <span style={{ width: 28, height: 28, borderRadius: 10, background: "var(--gradient-primary)", color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 12 }}>
              DM
            </span>
            DevMaster
          </h2>
          <p>Tạo tài khoản mới để bắt đầu học tập</p>
        </div>

        {/* Thông báo thành công/lỗi */}
        {message.text && (
          <div className={`message-box ${message.type}`} style={{ textAlign: "left" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              {message.type === "success" ? <Icon name="checkCircle" size={16} /> : <Icon name="lock" size={16} />}
              {message.text}
            </span>
          </div>
        )}

        {/* Form đăng ký */}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Họ và tên</label>
            <input
              type="text"
              placeholder="Họ và tên"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

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
            <label>Mật khẩu (tối thiểu 6 ký tự)</label>
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="input-group">
            <label>Xác nhận mật khẩu</label>
            <input
              type="password"
              placeholder="Xác nhận mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          {/* Nút đăng ký */}
          <button
            type="submit"
            className="btn btn-primary auth-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Đang xử lý...
              </>
            ) : (
              "Tạo tài khoản"
            )}
          </button>
        </form>

        {/* Link đăng nhập */}
        <p className="auth-footer">
          Đã có tài khoản?{" "}
          <Link to="/login">Đăng nhập ngay</Link>
        </p>
      </div>
    </div>
  );
}