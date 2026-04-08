// ================================================
// PAGE: AdminUsers - Quản lý người dùng (Admin)
// Mô tả: Xem danh sách user, phân quyền, khóa/mở tài khoản
// FEATURE 8, 9, 10: Lấy ds user / Đổi vai trò / Khóa tài khoản
// ================================================
import { useState, useEffect } from "react";
import {
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
} from "../../services/authService";
import AdminLayout from "../../components/AdminLayout";
import Icon from "../../components/Icon";

export default function AdminUsers() {
  // ================================================
  // STATE QUẢN LÝ DỮ LIỆU
  // ================================================
  const [users, setUsers] = useState([]);      // Danh sách người dùng
  const [loading, setLoading] = useState(true); // Loading khi tải dữ liệu
  const [processing, setProcessing] = useState(null); // ID user đang xử lý

  // ================================================
  // STATE BỘ LỌC
  // ================================================
  const [filter, setFilter] = useState({
    role: "",      // Lọc theo vai trò: user / instructor / admin
    search: "",    // Tìm kiếm theo tên hoặc email
    isActive: "",  // Lọc theo trạng thái: active / banned
  });

  // ================================================
  // STATE THÔNG BÁO
  // ================================================
  const [message, setMessage] = useState({ type: "", text: "" });

  // ================================================
  // EFFECT: Load danh sách user khi component mount
  // ================================================
  useEffect(() => {
    fetchUsers();
  }, []);

  // ================================================
  // HÀM: Gọi API lấy danh sách người dùng
  // FEATURE 8: Lấy danh sách tất cả người dùng
  // ================================================
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getAllUsers(filter);
      if (res.data.success) setUsers(res.data.data);
    } catch (err) {
      console.error("Lỗi tải người dùng:", err);
    } finally {
      setLoading(false);
    }
  };

  // ================================================
  // HÀM: Hiện thông báo (tự động ẩn sau 4s)
  // ================================================
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  // ================================================
  // HÀM: Xử lý tìm kiếm (submit form)
  // ================================================
  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  // ================================================
  // HÀM: Đổi vai trò người dùng
  // FEATURE 9: Thay đổi vai trò
  // ================================================
  const handleRoleChange = async (userId, newRole) => {
    // Ngăn admin tự đổi vai trò chính mình
    setProcessing(userId);
    try {
      // ================================================
      // FEATURE 9: PUT /api/auth/users/:userId/role
      // Body: { role: "admin" | "instructor" | "user" }
      // ================================================
      const res = await updateUserRole(userId, newRole);
      if (res.data.success) {
        showMessage("success", "Đổi vai trò thành công!");
        // Cập nhật lại danh sách mà không gọi API lại (tối ưu)
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      showMessage("error", err.response?.data?.message || "Lỗi đổi vai trò");
      // Khôi phục lại giá trị cũ trong select (fetch lại)
      fetchUsers();
    } finally {
      setProcessing(null);
    }
  };

  // ================================================
  // HÀM: Khóa / Mở tài khoản người dùng
  // FEATURE 10: Toggle trạng thái tài khoản
  // ================================================
  const handleToggleStatus = async (userId) => {
    setProcessing(userId);
    try {
      // ================================================
      // FEATURE 10: PATCH /api/auth/users/:userId/status
      // Toggle isActive: true <-> false
      // ================================================
      const res = await toggleUserStatus(userId);
      if (res.data.success) {
        showMessage("success", res.data.message);
        // Cập nhật trạng thái trong danh sách
        setUsers((prev) =>
          prev.map((u) =>
            u._id === userId ? { ...u, isActive: !u.isActive } : u
          )
        );
      }
    } catch (err) {
      showMessage("error", err.response?.data?.message || "Lỗi thao tác");
    } finally {
      setProcessing(null);
    }
  };

  // ================================================
  // HÀM: Xóa vĩnh viễn người dùng
  // FEATURE 11: Xóa tài khoản
  // ================================================
  const handleDeleteUser = async (userId, userName) => {
    // Xác nhận trước khi xóa
    if (!window.confirm(`Bạn có chắc muốn xóa vĩnh viễn tài khoản "${userName}"?\n\nHành động này không thể hoàn tác!`)) {
      return;
    }

    setProcessing(userId);
    try {
      const res = await deleteUser(userId);
      if (res.data.success) {
        showMessage("success", "Đã xóa người dùng thành công!");
        // Cập nhật lại danh sách (xóa khỏi state)
        setUsers((prev) => prev.filter((u) => u._id !== userId));
      }
    } catch (err) {
      showMessage("error", err.response?.data?.message || "Lỗi khi xóa người dùng");
    } finally {
      setProcessing(null);
    }
  };

  // ================================================
  // HÀM: Map vai trò -> Badge (màu sắc khác nhau)
  // ================================================
  const getRoleBadge = (role) => {
    const configs = {
      admin: { label: "Quản trị", cls: "badge-admin", icon: "settings" },
      instructor: { label: "Giảng viên", cls: "badge-instructor", icon: "user" },
      user: { label: "Học viên", cls: "badge-user", icon: "user" },
    };
    const cfg = configs[role] || configs.user;
    return (
      <span className={`badge badge-role ${cfg.cls}`} style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
        <Icon name={cfg.icon} size={14} />
        {cfg.label}
      </span>
    );
  };

  // ================================================
  // RENDER: Giao diện trang quản lý người dùng
  // ================================================
  return (
    <AdminLayout
      title="Quản lý Người dùng"
      subtitle="Xem danh sách, phân quyền và quản lý trạng thái tài khoản người dùng"
    >
      {/* ==================== THÔNG BÁO ==================== */}
      {message.text && (
        <div className={`message-box ${message.type}`}>{message.text}</div>
      )}

      {/* ==================== BỘ LỌC TÌM KIẾM ==================== */}
      <div className="admin-page-actions">
        {/* Form tìm kiếm + lọc */}
        <form
          onSubmit={handleSearch}
          style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}
        >
          {/* Input tìm kiếm */}
          <input
            type="text"
            className="admin-table-search"
            placeholder="Tìm theo tên hoặc email..."
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          />

          {/* Select lọc vai trò */}
          <select
            className="admin-table-filter-select"
            value={filter.role}
            onChange={(e) => {
              setFilter({ ...filter, role: e.target.value });
              fetchUsers();
            }}
          >
            <option value="">Tất cả vai trò</option>
            <option value="user">Học viên</option>
            <option value="instructor">Giảng viên</option>
            <option value="admin">Quản trị</option>
          </select>

          {/* Select lọc trạng thái */}
          <select
            className="admin-table-filter-select"
            value={filter.isActive}
            onChange={(e) => {
              setFilter({ ...filter, isActive: e.target.value });
              fetchUsers();
            }}
          >
            <option value="">Tất cả</option>
            <option value="true">Hoạt động</option>
            <option value="false">Bị khóa</option>
          </select>

          {/* Nút tìm kiếm */}
          <button type="submit" className="btn btn-primary btn-sm">
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <Icon name="search" size={16} />
              Tìm kiếm
            </span>
          </button>
        </form>

        {/* Số lượng user */}
        <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
          {users.length} người dùng
        </span>
      </div>

      {/* ==================== BẢNG NGƯỜI DÙNG ==================== */}
      <div className="admin-table-wrapper">
        {loading ? (
          <div className="admin-loading">
            <div className="spinner spinner-large spinner-dark"></div>
            <p>Đang tải danh sách người dùng...</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Ngày tham gia</th>
                <th style={{ width: "160px" }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  {/* Avatar + Tên */}
                  <td>
                    <div className="admin-user-cell">
                      {/* Avatar tròn: chữ cái đầu hoặc ảnh */}
                      <div className="admin-user-cell-avatar">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} />
                        ) : (
                          user.name?.charAt(0)?.toUpperCase() || "U"
                        )}
                      </div>
                      <div>
                        <div className="admin-user-cell-name">{user.name}</div>
                        {/* Email nhỏ phía dưới tên */}
                        <div className="admin-user-cell-email">{user.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td style={{ color: "#64748b" }}>{user.email}</td>

                  {/* Vai trò - Select dropdown để đổi */}
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className="admin-table-filter-select"
                      style={{ minWidth: "140px" }}
                      disabled={
                        processing === user._id ||
                        user.role === "admin" // Khóa không cho đổi vai trò admin chính
                      }
                      title={
                        user.role === "admin"
                          ? "Không thể đổi vai trò Admin"
                          : "Chọn vai trò mới"
                      }
                    >
                      <option value="user">Học viên</option>
                      <option value="instructor">Giảng viên</option>
                      <option value="admin">Quản trị</option>
                    </select>
                  </td>

                  {/* Trạng thái tài khoản */}
                  <td>
                    <span className={`badge-status ${user.isActive !== false ? "badge-published" : "badge-archived"}`}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                        {user.isActive !== false ? <Icon name="checkCircle" size={14} /> : <Icon name="lock" size={14} />}
                        {user.isActive !== false ? "Hoạt động" : "Bị khóa"}
                      </span>
                    </span>
                  </td>

                  {/* Ngày tạo tài khoản */}
                  <td style={{ color: "#64748b", fontSize: "0.83rem" }}>
                    {new Date(user.createdAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </td>

                  {/* Hành động: Khóa / Mở khóa */}
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {/* Nút Khóa / Mở khóa */}
                      <button
                        className={`btn-action ${user.isActive !== false ? "btn-delete" : "btn-primary"}`}
                        onClick={() => handleToggleStatus(user._id)}
                        disabled={processing === user._id}
                        title={
                          user.isActive !== false
                            ? "Khóa tài khoản này"
                            : "Mở khóa tài khoản này"
                        }
                      >
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                          {user.isActive !== false ? <Icon name="lock" size={14} /> : <Icon name="checkCircle" size={14} />}
                          {user.isActive !== false ? "Khóa" : "Mở khóa"}
                        </span>
                      </button>

                      {/* Nút Xóa vĩnh viễn */}
                      <button
                        className="btn-action btn-delete"
                        onClick={() => handleDeleteUser(user._id, user.name)}
                        disabled={processing === user._id || user.role === "admin"}
                        title="Xóa vĩnh viễn người dùng này"
                      >
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                          <Icon name="logout" size={14} />
                          Xóa
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td colSpan="6" className="admin-empty-cell">
                    Không tìm thấy người dùng nào phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}