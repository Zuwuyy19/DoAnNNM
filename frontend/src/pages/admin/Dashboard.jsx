// ================================================
// PAGE: AdminDashboard - Trang tổng quan quản trị (Admin)
// Mô tả: Hiển thị thống kê số liệu quan trọng dưới dạng card
// FEATURE 18: Lấy thống kê Dashboard từ API
// ================================================
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { getDashboardStats } from "../../services/courseService";
import Icon from "../../components/Icon";

export default function AdminDashboard() {
  // State lưu dữ liệu thống kê
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // ================================================
  // FEATURE 18: Lấy thống kê từ API khi component mount
  // ================================================
  useEffect(() => {
    fetchStats();
  }, []);

  // Hàm gọi API lấy thống kê
  const fetchStats = async () => {
    try {
      const res = await getDashboardStats();
      // Nếu API trả về thành công -> lưu vào state
      if (res.data.success) setStats(res.data.data);
    } catch (err) {
      console.error("Lỗi lấy thống kê:", err);
    } finally {
      // Tắt loading dù thành công hay thất bại
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Tổng quan" subtitle="Chào mừng bạn đến trang quản trị DevMaster">

      {/* ==================== THẺ THỐNG KÊ ==================== */}
      {/* Hiển thị 6 metric chính: khóa học, học viên, giảng viên, doanh thu... */}
      <div className="admin-stats-grid">
        {/* Card: Tổng số khóa học */}
        <div className="admin-stat-card">
          <div className="admin-stat-icon blue"><Icon name="star" size={18} /></div>
          <div className="admin-stat-info">
            <h3>{stats?.totalCourses || 0}</h3>
            <p>Khóa học</p>
          </div>
        </div>

        {/* Card: Tổng số học viên */}
        <div className="admin-stat-card">
          <div className="admin-stat-icon green"><Icon name="users" size={18} /></div>
          <div className="admin-stat-info">
            <h3>{stats?.totalStudents || 0}</h3>
            <p>Học viên</p>
          </div>
        </div>

        {/* Card: Tổng số giảng viên */}
        <div className="admin-stat-card">
          <div className="admin-stat-icon purple"><Icon name="user" size={18} /></div>
          <div className="admin-stat-info">
            <h3>{stats?.totalInstructors || 0}</h3>
            <p>Giảng viên</p>
          </div>
        </div>

        {/* Card: Tổng doanh thu */}
        <div className="admin-stat-card">
          <div className="admin-stat-icon warning"><Icon name="clock" size={18} /></div>
          <div className="admin-stat-info">
            <h3>{(stats?.totalRevenue || 0).toLocaleString("vi-VN")}đ</h3>
            <p>Tổng doanh thu</p>
          </div>
        </div>

        {/* Card: Doanh thu tháng này */}
        <div className="admin-stat-card">
          <div className="admin-stat-icon green"><Icon name="clock" size={18} /></div>
          <div className="admin-stat-info">
            <h3>{(stats?.monthlyRevenue || 0).toLocaleString("vi-VN")}đ</h3>
            <p>Doanh thu tháng này</p>
          </div>
        </div>

        {/* Card: Tổng số đơn hàng */}
        <div className="admin-stat-card">
          <div className="admin-stat-icon blue"><Icon name="clock" size={18} /></div>
          <div className="admin-stat-info">
            <h3>{stats?.orderStats?.reduce((sum, o) => sum + o.count, 0) || 0}</h3>
            <p>Đơn hàng</p>
          </div>
        </div>
      </div>

      {/* ==================== BẢNG TỔNG HỢP ==================== */}
      {/* Hiển thị 3 bảng: khóa phổ biến, khóa đánh giá cao, đơn hàng gần đây */}
      <div className="admin-grid-2">
        {/* Bảng 1: Khóa học phổ biến nhất */}
        <div className="admin-card">
          <h3>Khóa học phổ biến nhất</h3>
          {loading ? (
            <div className="admin-loading">Đang tải...</div>
          ) : stats?.popularCourses?.length > 0 ? (
            <ul className="admin-list">
              {stats.popularCourses.map((course, idx) => (
                <li key={course._id} className="admin-list-item">
                  {/* Số thứ tự */}
                  <div className="admin-list-rank">#{idx + 1}</div>
                  {/* Tên khóa học + danh mục */}
                  <div className="admin-list-content">
                    <div className="admin-list-title">{course.title}</div>
                    <div className="admin-list-meta">{course.category?.name || "Không danh mục"}</div>
                  </div>
                  {/* Số học viên */}
                  <div className="admin-list-value">{course.enrolledCount} HV</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="admin-loading">Chưa có dữ liệu</div>
          )}
          {/* Link xem chi tiết */}
          <Link to="/admin/courses" className="admin-card-link">
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              Xem tất cả <Icon name="chevronRight" size={16} />
            </span>
          </Link>
        </div>

        {/* Bảng 2: Khóa học đánh giá cao */}
        <div className="admin-card">
          <h3>Khóa học đánh giá cao</h3>
          {loading ? (
            <div className="admin-loading">Đang tải...</div>
          ) : stats?.topRatedCourses?.length > 0 ? (
            <ul className="admin-list">
              {stats.topRatedCourses.map((course, idx) => (
                <li key={course._id} className="admin-list-item">
                  <div className="admin-list-rank">#{idx + 1}</div>
                  <div className="admin-list-content">
                    <div className="admin-list-title">{course.title}</div>
                    <div className="admin-list-meta">
                      {course.averageRating} · {course.totalReviews} đánh giá
                    </div>
                  </div>
                  <div className="admin-list-value">{course.totalReviews} đánh giá</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="admin-loading">Chưa có dữ liệu</div>
          )}
          <Link to="/admin/courses" className="admin-card-link">
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              Xem tất cả <Icon name="chevronRight" size={16} />
            </span>
          </Link>
        </div>

        {/* Bảng 3: Đơn hàng gần đây */}
        <div className="admin-card">
          <h3>Đơn hàng gần đây</h3>
          {loading ? (
            <div className="admin-loading">Đang tải...</div>
          ) : stats?.recentOrders?.length > 0 ? (
            <ul className="admin-list">
              {stats.recentOrders.map((order) => (
                <li key={order._id} className="admin-list-item">
                  {/* Mã đơn hàng */}
                  <div className="admin-list-rank" style={{ background: "#f5f3ff", color: "#8b5cf6" }}>
                    #{order.orderNumber?.split("-")[2] || order._id?.slice(-4)}
                  </div>
                  <div className="admin-list-content">
                    {/* Tên người mua */}
                    <div className="admin-list-title">{order.user?.name || "Khách"}</div>
                    {/* Email */}
                    <div className="admin-list-meta">{order.user?.email}</div>
                  </div>
                  {/* Tổng tiền */}
                  <div className="admin-list-value" style={{ color: "#10b981" }}>
                    {order.totalAmount.toLocaleString("vi-VN")}đ
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="admin-loading">Chưa có đơn hàng nào</div>
          )}
          <Link to="/admin/orders" className="admin-card-link">
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              Xem tất cả đơn hàng <Icon name="chevronRight" size={16} />
            </span>
          </Link>
        </div>

        {/* Bảng 4: Trạng thái đơn hàng */}
        <div className="admin-card">
          <h3>Thống kê đơn hàng</h3>
          {loading ? (
            <div className="admin-loading">Đang tải...</div>
          ) : stats?.orderStats?.length > 0 ? (
            <ul className="admin-list">
              {stats.orderStats.map((item) => {
                // Map trạng thái với màu sắc
                const statusConfig = {
                  paid: { label: "Đã thanh toán", color: "#10b981" },
                  pending: { label: "Chờ xử lý", color: "#f59e0b" },
                  failed: { label: "Thất bại", color: "#ef4444" },
                  refunded: { label: "Hoàn tiền", color: "#8b5cf6" },
                };
                const config = statusConfig[item._id] || { label: item._id, color: "#64748b" };
                return (
                  <li key={item._id} className="admin-list-item">
                    <div className="admin-list-content">
                      <div className="admin-list-title" style={{ color: config.color }}>
                        {config.label}
                      </div>
                    </div>
                    <div className="admin-list-value">{item.count} đơn</div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="admin-loading">Chưa có dữ liệu</div>
          )}
          <Link to="/admin/orders" className="admin-card-link">
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              Quản lý đơn hàng <Icon name="chevronRight" size={16} />
            </span>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}