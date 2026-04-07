// ================================================
// PAGE: MyOrders - Trang lịch sử đơn hàng
// Mô tả: Hiển thị danh sách đơn hàng đã mua
// FEATURE 25: Lấy danh sách đơn hàng của user
// ================================================
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyOrders } from "../services/orderService";
import Icon from "../components/Icon";
import "../styles/course.css";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await getMyOrders();
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error("Lỗi lấy đơn hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  // ================================================
  // Màu sắc theo trạng thái thanh toán
  // ================================================
  const getStatusColor = (status) => {
    switch (status) {
      case "paid": return "var(--success)";
      case "pending": return "var(--warning)";
      case "failed": return "var(--danger)";
      case "refunded": return "var(--text-muted)";
      default: return "var(--text-muted)";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "paid": return "Đã thanh toán";
      case "pending": return "Đang xử lý";
      case "failed": return "Thất bại";
      case "refunded": return "Đã hoàn tiền";
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="course-detail-container">
        <div className="loading-state">
          <div className="spinner spinner-large"></div>
          <p>Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="course-detail-container">
      <div className="course-detail-inner">
        {/* ===== HEADER ===== */}
        <div style={{
          background: "linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)",
          padding: "40px 0 32px",
          textAlign: "center",
          borderBottom: "1px solid var(--border)",
          marginBottom: "32px",
        }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "800", color: "var(--text-primary)", marginBottom: "8px" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
              <Icon name="clock" size={20} /> Lịch sử đơn hàng
            </span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            {orders.length} đơn hàng
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <h3 style={{ color: "var(--text-primary)", marginBottom: "8px" }}>
              Chưa có đơn hàng nào
            </h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>
              Hãy đăng ký khóa học đầu tiên của bạn!
            </p>
            <Link to="/courses" className="btn btn-primary">
              Khám phá khóa học
            </Link>
          </div>
        ) : (
          <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "40px" }}>
            {orders.map((order) => (
              <div key={order._id} style={{
                background: "white",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                padding: "20px",
                boxShadow: "var(--shadow-sm)",
              }}>
                {/* Header: mã đơn + trạng thái + ngày */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "14px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid var(--border-light)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontWeight: "700", fontSize: "0.9rem", color: "var(--text-primary)" }}>
                      #{order.orderNumber}
                    </span>
                    <span style={{ color: getStatusColor(order.paymentStatus), fontSize: "0.8rem", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                      {order.paymentStatus === "paid" ? <Icon name="checkCircle" size={14} /> : <Icon name="clock" size={14} />}
                      {getStatusText(order.paymentStatus)}
                    </span>
                  </div>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>

                {/* Items */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
                  {order.items?.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <img
                        src={item.course?.image}
                        alt={item.course?.title}
                        style={{ width: "56px", height: "40px", borderRadius: "var(--radius)", objectFit: "cover" }}
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&q=80";
                        }}
                      />
                      <div style={{ flex: "1", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                        <Link
                          to={`/courses/${item.course?.slug}`}
                          style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--text-primary)", flex: "1", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                        >
                          {item.course?.title}
                        </Link>
                        <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-primary)", flexShrink: "0" }}>
                          {item.priceAtPurchase.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer: tổng tiền + phương thức */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "12px",
                  borderTop: "1px solid var(--border-light)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                    {order.discountAmount > 0 && (
                      <span style={{ background: "var(--success-light)", color: "var(--success)", padding: "2px 10px", borderRadius: "var(--radius-full)", fontSize: "0.72rem", fontWeight: "700" }}>
                        Giảm {order.discountAmount.toLocaleString("vi-VN")}đ
                      </span>
                    )}
                    <strong style={{ color: "var(--text-primary)" }}>
                      Thành tiền: {order.totalAmount.toLocaleString("vi-VN")}đ
                    </strong>
                  </div>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    {order.paymentMethod?.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
