// ================================================
// PAGE: AdminOrders - Quản lý đơn hàng (Admin)
// Mô tả: Xem danh sách đơn hàng, cập nhật trạng thái thanh toán
// ================================================
import { useState, useEffect } from "react";
import { getAllOrders } from "../../services/orderService";
import AdminLayout from "../../components/AdminLayout";
import Icon from "../../components/Icon";

export default function AdminOrders() {
  // ================================================
  // STATE QUẢN LÝ DỮ LIỆU
  // ================================================
  const [orders, setOrders] = useState([]);       // Danh sách đơn hàng
  const [loading, setLoading] = useState(true);  // Loading khi tải dữ liệu

  // ================================================
  // STATE BỘ LỌC
  // ================================================
  const [filter, setFilter] = useState({
    paymentStatus: "",  // Lọc theo trạng thái thanh toán
    search: "",         // Tìm kiếm theo mã đơn hoặc tên
  });

  // ================================================
  // STATE THÔNG BÁO
  // ================================================
  const [message, setMessage] = useState({ type: "", text: "" });

  // ================================================
  // EFFECT: Load đơn hàng khi component mount
  // ================================================
  useEffect(() => {
    fetchOrders();
  }, []);

  // ================================================
  // HÀM: Gọi API lấy danh sách đơn hàng
  // ================================================
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getAllOrders(filter);
      if (res.data.success) setOrders(res.data.data);
    } catch (err) {
      console.error("Lỗi tải đơn hàng:", err);
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
  // HÀM: Map trạng thái -> Badge
  // ================================================
  const getStatusBadge = (status) => {
    const configs = {
      paid: { label: "Đã thanh toán", cls: "badge-published", icon: "checkCircle" },
      pending: { label: "Chờ xử lý", cls: "badge-draft", icon: "clock" },
      failed: { label: "Thất bại", cls: "badge-archived", icon: "lock" },
      refunded: { label: "Hoàn tiền", cls: "badge-role", icon: "clock" },
    };
    const cfg = configs[status] || { label: status, cls: "" };
    return (
      <span className={`badge-status ${cfg.cls}`} style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
        {cfg.icon ? <Icon name={cfg.icon} size={14} /> : null}
        {cfg.label}
      </span>
    );
  };

  // ================================================
  // HÀM: Map phương thức thanh toán -> Icon
  // ================================================
  const getPaymentMethodIcon = (method) => {
    const icons = {
      vnpay: "VNPay",
      momo: "MoMo",
      banking: "Banking",
      cod: "COD",
    };
    return icons[method] || method?.toUpperCase() || "—";
  };

  // ================================================
  // RENDER: Giao diện trang quản lý đơn hàng
  // ================================================
  return (
    <AdminLayout
      title="Quản lý Đơn hàng"
      subtitle="Theo dõi và cập nhật trạng thái đơn hàng của khách hàng"
    >
      {/* ==================== THÔNG BÁO ==================== */}
      {message.text && (
        <div className={`message-box ${message.type}`}>{message.text}</div>
      )}

      {/* ==================== THỐNG KÊ NHANH ==================== */}
      {/* 4 thẻ nhỏ: Tổng đơn, Đã thanh toán, Chờ xử lý, Thất bại */}
      <div className="admin-stats-grid" style={{ marginBottom: "20px" }}>
        {[
          { label: "Tổng đơn", count: orders.length, icon: "clock", color: "blue" },
          {
            label: "Đã thanh toán",
            count: orders.filter((o) => o.paymentStatus === "paid").length,
            icon: "checkCircle", color: "green"
          },
          {
            label: "Chờ xử lý",
            count: orders.filter((o) => o.paymentStatus === "pending").length,
            icon: "clock", color: "warning"
          },
          {
            label: "Thất bại",
            count: orders.filter((o) => o.paymentStatus === "failed").length,
            icon: "lock", color: "danger"
          },
        ].map((stat) => (
          <div key={stat.label} className="admin-stat-card" style={{ padding: "14px 16px" }}>
            <div className={`admin-stat-icon ${stat.color}`} style={{ width: "40px", height: "40px", fontSize: "1.1rem" }}>
              <Icon name={stat.icon} size={18} />
            </div>
            <div className="admin-stat-info">
              <h3 style={{ fontSize: "1.2rem" }}>{stat.count}</h3>
              <p style={{ fontSize: "0.75rem" }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ==================== BỘ LỌC ==================== */}
      <div className="admin-page-actions">
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Input tìm kiếm theo mã đơn / tên */}
          <input
            type="text"
            className="admin-table-search"
            placeholder="Tìm mã đơn, tên khách hàng..."
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && fetchOrders()}
          />
          {/* Select lọc trạng thái thanh toán */}
          <select
            className="admin-table-filter-select"
            value={filter.paymentStatus}
            onChange={(e) => {
              setFilter({ ...filter, paymentStatus: e.target.value });
              fetchOrders();
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="paid">Đã thanh toán</option>
            <option value="pending">Chờ xử lý</option>
            <option value="failed">Thất bại</option>
            <option value="refunded">Hoàn tiền</option>
          </select>
          {/* Nút làm mới */}
          <button className="btn btn-outline btn-sm" onClick={fetchOrders}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <Icon name="clock" size={16} /> Làm mới
            </span>
          </button>
        </div>
      </div>

      {/* ==================== BẢNG ĐƠN HÀNG ==================== */}
      <div className="admin-table-wrapper">
        {loading ? (
          <div className="admin-loading">
            <div className="spinner spinner-large spinner-dark"></div>
            <p>Đang tải đơn hàng...</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Khóa học</th>
                <th>Tổng tiền</th>
                <th>Thanh toán</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  {/* Mã đơn */}
                  <td>
                    <code style={{
                      background: "#f1f5f9", padding: "3px 8px",
                      borderRadius: "4px", fontSize: "0.78rem",
                      color: "#3b82f6", fontWeight: "600"
                    }}>
                      #{order.orderNumber}
                    </code>
                  </td>

                  {/* Thông tin khách hàng */}
                  <td>
                    <div className="admin-user-cell">
                      <div className="admin-user-cell-avatar" style={{ width: "30px", height: "30px", fontSize: "0.75rem" }}>
                        {order.user?.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <div style={{ fontWeight: "600", fontSize: "0.85rem", color: "#1e293b" }}>
                          {order.user?.name || "—"}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                          {order.buyerEmail}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Danh sách khóa học trong đơn */}
                  <td>
                    <div style={{ maxWidth: "200px" }}>
                      {order.items?.map((item, i) => (
                        <div key={i} style={{
                          fontSize: "0.8rem", color: "#475569",
                          marginBottom: "2px",
                          display: "flex", justifyContent: "space-between", gap: "8px"
                        }}>
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "140px" }}>
                            {item.course?.title || "Khóa học"}
                          </span>
                          <span style={{ color: "#10b981", fontWeight: "600", flexShrink: 0 }}>
                            {item.priceAtPurchase?.toLocaleString("vi-VN")}đ
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Tổng tiền */}
                  <td>
                    <strong style={{ color: "#10b981", fontSize: "0.9rem" }}>
                      {order.totalAmount.toLocaleString("vi-VN")}đ
                    </strong>
                    {order.discountAmount > 0 && (
                      <div style={{ fontSize: "0.72rem", color: "#ef4444" }}>
                        - {order.discountAmount.toLocaleString("vi-VN")}đ (mã: {order.couponCode})
                      </div>
                    )}
                  </td>

                  {/* Phương thức thanh toán */}
                  <td style={{ fontSize: "0.83rem", color: "#64748b" }}>
                    {getPaymentMethodIcon(order.paymentMethod)}
                  </td>

                  {/* Trạng thái thanh toán */}
                  <td>
                    {getStatusBadge(order.paymentStatus)}
                  </td>

                  {/* Ngày tạo */}
                  <td style={{ color: "#64748b", fontSize: "0.83rem", whiteSpace: "nowrap" }}>
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                      {new Date(order.createdAt).toLocaleTimeString("vi-VN", {
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </div>
                  </td>


                </tr>
              ))}

              {orders.length === 0 && (
                <tr>
                  <td colSpan="7" className="admin-empty-cell">
                    Chưa có đơn hàng nào
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
