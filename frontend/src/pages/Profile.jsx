// ================================================
// PAGE: Profile - Trang thông tin cá nhân
// Mô tả: Hiển thị và cập nhật thông tin người dùng
// FEATURE 3, 4, 5: Lấy, cập nhật profile, đổi mật khẩu
// ================================================
import { useState, useEffect } from "react";
import { getProfile, updateProfile, changePassword, getUser } from "../services/authService";
import Icon from "../components/Icon";
import "../styles/profile.css";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");

  // Form thông tin
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  // Form đổi mật khẩu
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  // ================================================
  // Mount: lấy thông tin profile từ API
  // ================================================
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getProfile();
      if (res.data.success) {
        const userData = res.data.data;
        setUser(userData);
        setName(userData.name || "");
        setPhone(userData.phone || "");
        setBio(userData.bio || "");
      }
    } catch (err) {
      setMessage({ type: "error", text: "Không thể tải thông tin hồ sơ" });
    } finally {
      setLoading(false);
    }
  };

  // ================================================
  // FEATURE 4: Cập nhật thông tin cá nhân
  // ================================================
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await updateProfile({ name, phone, bio });
      if (res.data.success) {
        setUser(res.data.data);
        setMessage({ type: "success", text: "Cập nhật hồ sơ thành công!" });
        const currentUser = getUser();
        localStorage.setItem("user", JSON.stringify({ ...currentUser, name, phone, bio }));
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Lỗi cập nhật" });
    } finally {
      setLoading(false);
    }
  };

  // ================================================
  // FEATURE 5: Đổi mật khẩu
  // ================================================
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Mật khẩu mới không khớp" });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Mật khẩu mới phải ít nhất 6 ký tự" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await changePassword({ currentPassword, newPassword });
      if (res.data.success) {
        setMessage({ type: "success", text: "Đổi mật khẩu thành công!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Lỗi đổi mật khẩu" });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return (
      <div className="profile-page">
        <div className="loading-state">
          <div className="spinner spinner-large"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* ===== SIDEBAR: AVATAR + MENU ===== */}
        <div className="profile-sidebar">
          <div className="profile-avatar">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <div className="avatar-placeholder">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
            )}
          </div>
          <h3 className="profile-name">{user?.name}</h3>
          <p className="profile-email">{user?.email}</p>
          <span className={`role-badge role-${user?.role}`}>
            {user?.role === "admin" ? "Quản trị" : user?.role === "instructor" ? "Giảng viên" : "Học viên"}
          </span>

          {/* Menu điều hướng */}
          <div className="profile-nav">
            <button
              className={`profile-nav-btn ${activeTab === "info" ? "active" : ""}`}
              onClick={() => setActiveTab("info")}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
                <Icon name="user" size={16} /> Thông tin cá nhân
              </span>
            </button>
            <button
              className={`profile-nav-btn ${activeTab === "password" ? "active" : ""}`}
              onClick={() => setActiveTab("password")}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
                <Icon name="lock" size={16} /> Đổi mật khẩu
              </span>
            </button>
          </div>
        </div>

        {/* ===== MAIN CONTENT ===== */}
        <div className="profile-content">
          {message.text && (
            <div className={`message-box ${message.type}`}>{message.text}</div>
          )}

          {/* Tab: Thông tin cá nhân */}
          {activeTab === "info" && (
            <div className="profile-section">
              <h2>Thông tin cá nhân</h2>
              <form onSubmit={handleUpdateProfile} className="profile-form">
                <div className="input-group">
                  <label>Họ và tên</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nhập họ tên"
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Email</label>
                  <input type="email" value={user?.email} disabled />
                </div>
                <div className="input-group">
                  <label>Số điện thoại</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <div className="input-group">
                  <label>Giới thiệu bản thân</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Giới thiệu ngắn về bạn..."
                    rows={4}
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </form>
            </div>
          )}

          {/* Tab: Đổi mật khẩu */}
          {activeTab === "password" && (
            <div className="profile-section">
              <h2>Đổi mật khẩu</h2>
              <form onSubmit={handleChangePassword} className="profile-form">
                <div className="input-group">
                  <label>Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Nhập mật khẩu hiện tại"
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Mật khẩu mới</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Đang đổi..." : "Đổi mật khẩu"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}