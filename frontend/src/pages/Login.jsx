import { useState } from "react";
import "../styles/auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Vui lòng nhập email và mật khẩu");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await res.json();
      console.log("Login response:", data);

      if (!res.ok) {
        alert(data.message || "Đăng nhập thất bại");
        return;
      }
// lưu dữ liệu
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    alert("Đăng nhập thành công!");

      // redirect
      window.location.href = "/dashboard";

    } catch (error) {
      console.error(error);
      alert("Không thể kết nối server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="glow glow-1"></div>
      <div className="glow glow-2"></div>

      <div className="auth-card glass-panel">
        <div className="auth-header">
          <h2 className="text-gradient">Đăng nhập</h2>
          <p>Chào mừng bạn quay trở lại</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <i className="fas fa-envelope"></i>
            <input
              type="email"
              placeholder="Email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <i className="fas fa-lock"></i>
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="auth-actions">
            <a href="/forgot" className="forgot-link">
              Quên mật khẩu?
            </a>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-large auth-btn"
            disabled={loading}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="auth-footer">
          Chưa có tài khoản?{" "}
          <a href="/register" className="text-gradient">
            Đăng ký ngay
          </a>
        </p>
      </div>
    </div>
  );
}