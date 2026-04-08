// ================================================
// PAGE: AdminCoupons - Quản lý mã giảm giá (Admin)
// Mô tả: CRUD mã giảm giá, phần trăm hoặc số tiền cố định
// ================================================
import { useState, useEffect } from "react";
import api from "../../services/api";
import AdminLayout from "../../components/AdminLayout";
import Icon from "../../components/Icon";

// ================================================
// HÀM TIỆN ÍCH: Format ngày tháng
// ================================================
const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("vi-VN");
};

// ================================================
// HÀM TIỆN ÍCH: Badge trạng thái coupon
// ================================================
const getCouponStatus = (coupon) => {
  const now = new Date();
  const start = coupon.startDate ? new Date(coupon.startDate) : null;
  const end = coupon.endDate ? new Date(coupon.endDate) : null;

  // Chưa bắt đầu
  if (start && now < start) return { label: "Sắp diễn ra", cls: "badge-draft", icon: "clock" };
  // Đã hết hạn
  if (end && now > end) return { label: "Hết hạn", cls: "badge-archived", icon: "clock" };
  // Hết số lượng
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return { label: "Hết mã", cls: "badge-archived", icon: "lock" };
  }
  // Hoạt động
  return { label: "Đang hoạt động", cls: "badge-published", icon: "checkCircle" };
};

export default function AdminCoupons() {
  // ================================================
  // STATE QUẢN LÝ DỮ LIỆU
  // ================================================
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  // ================================================
  // STATE FORM DATA: Dữ liệu form tạo/sửa coupon
  // ================================================
  const [formData, setFormData] = useState({
    code: "",           // Mã giảm giá (VD: SUMMER2026)
    name: "",           // Tên chiến dịch
    discountType: "percent",  // Loại: percent (%) / fixed (VNĐ)
    discountValue: 10,  // Giá trị giảm
    minOrderAmount: 0,  // Đơn hàng tối thiểu (VNĐ)
    maxDiscountAmount: "", // Giảm tối đa (chỉ khi giảm %)
    usageLimit: "",     // Số lượng mã (null = unlimited)
    usageCount: 0,      // Số lần đã sử dụng
    startDate: "",     // Ngày bắt đầu
    endDate: "",       // Ngày kết thúc
    isActive: true,     // Bật / Tắt
  });

  // ================================================
  // STATE THÔNG BÁO
  // ================================================
  const [message, setMessage] = useState({ type: "", text: "" });

  // ================================================
  // EFFECT: Load coupon khi component mount
  // ================================================
  useEffect(() => {
    fetchCoupons();
  }, []);

  // ================================================
  // HÀM: Gọi API lấy danh sách coupon
  // ================================================
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      // ================================================
      // GET /api/coupons - Lấy danh sách mã giảm giá
      // ================================================
      const res = await api.get("/coupons");
      if (res.data.success) {
        // API trả về: { data: [...], pagination: {...} }
        setCoupons(res.data.data || []);
      }
    } catch (err) {
      console.error("Lỗi tải mã giảm giá:", err);
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
  // HÀM: Mở form tạo coupon mới
  // ================================================
  const openCreate = () => {
    setEditingCoupon(null);
    setFormData({
      code: "",
      name: "",
      discountType: "percent",
      discountValue: 10,
      minOrderAmount: 0,
      maxDiscountAmount: "",
      usageLimit: "",
      usageCount: 0,
      startDate: "",
      endDate: "",
      isActive: true,
    });
    setShowForm(true);
    setMessage({ type: "", text: "" });
  };

  // ================================================
  // HÀM: Mở form sửa coupon
  // ================================================
  const openEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code || "",
      name: coupon.name || "",
      discountType: coupon.discountType || "percent",
      discountValue: coupon.discountValue || 10,
      minOrderAmount: coupon.minOrderAmount || 0,
      maxDiscountAmount: coupon.maxDiscountAmount || "",
      usageLimit: coupon.usageLimit || "",
      usageCount: coupon.usageCount || 0,
      startDate: coupon.startDate ? coupon.startDate.split("T")[0] : "",
      endDate: coupon.endDate ? coupon.endDate.split("T")[0] : "",
      isActive: coupon.isActive !== false,
    });
    setShowForm(true);
    setMessage({ type: "", text: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ================================================
  // HÀM: Xử lý submit form (tạo / cập nhật coupon)
  // ================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Chuẩn bị dữ liệu gửi lên
      const submitData = {
        ...formData,
        // Chuyển chuỗi thành số, null nếu rỗng
        discountValue: Number(formData.discountValue),
        minOrderAmount: Number(formData.minOrderAmount) || 0,
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        // Chuyển ngày tháng: chuỗi -> Date
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
      };

      let res;
      if (editingCoupon) {
        // ================================================
        // Cập nhật coupon hiện có
        // PUT /api/coupons/:couponId
        // ================================================
        res = await api.put(`/coupons/${editingCoupon._id}`, submitData);
      } else {
        // ================================================
        // Tạo coupon mới
        // POST /api/coupons
        // ================================================
        res = await api.post("/coupons", submitData);
      }

      if (res.data.success) {
        showMessage(
          "success",
          editingCoupon ? "Cập nhật mã giảm giá thành công!" : "Tạo mã giảm giá thành công!"
        );
        fetchCoupons();
        setTimeout(() => {
          setShowForm(false);
          setEditingCoupon(null);
        }, 1500);
      }
    } catch (err) {
      showMessage("error", err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  // ================================================
  // HÀM: Xóa coupon
  // ================================================
  const handleDelete = async (couponId, code) => {
    if (!window.confirm(`Xóa mã giảm giá "${code}"?\n\nHành động này không thể hoàn tác!`)) return;
    try {
      const res = await api.delete(`/coupons/${couponId}`);
      if (res.data.success) {
        showMessage("success", "Đã xóa mã giảm giá!");
        setCoupons((prev) => prev.filter((c) => c._id !== couponId));
      }
    } catch (err) {
      showMessage("error", err.response?.data?.message || "Lỗi khi xóa");
    }
  };

  // ================================================
  // RENDER: Giao diện trang quản lý coupon
  // ================================================
  return (
    <AdminLayout
      title="Quản lý Mã Giảm giá"
      subtitle="Tạo và quản lý mã khuyến mãi cho chiến dịch marketing"
    >
      {/* ==================== THÔNG BÁO ==================== */}
      {message.text && (
        <div className={`message-box ${message.type}`}>{message.text}</div>
      )}

      {/* ==================== FORM TẠO / SỬA MÃ GIẢM GIÁ ==================== */}
      {showForm && (
        <div className="admin-form-card">
          <h2>
            {editingCoupon ? "Sửa mã giảm giá" : "Tạo mã giảm giá mới"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="admin-form-grid">
              {/* Input: Mã giảm giá */}
              <div className="admin-form-group">
                <label>Mã giảm giá <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") })
                  }
                  required
                  maxLength={20}
                  placeholder="VD: SUMMER2026"
                  style={{ textTransform: "uppercase", fontWeight: "600", letterSpacing: "0.1em" }}
                  disabled={!!editingCoupon} // Không cho sửa mã khi đang cập nhật
                />
              </div>

              {/* Input: Tên chiến dịch */}
              <div className="admin-form-group">
                <label>Tên chiến dịch <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="VD: Summer Sale 2026"
                />
              </div>

              {/* Select: Loại giảm */}
              <div className="admin-form-group">
                <label>Loại giảm</label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                >
                  <option value="percent">Phần trăm (%)</option>
                  <option value="fixed">Số tiền cố định (VNĐ)</option>
                </select>
              </div>

              {/* Input: Giá trị giảm */}
              <div className="admin-form-group">
                <label>
                  Giá trị giảm {formData.discountType === "percent" ? "(%)" : "(VNĐ)"} <span className="required">*</span>
                </label>
                <input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  required
                  min="1"
                  max={formData.discountType === "percent" ? "100" : undefined}
                  placeholder={formData.discountType === "percent" ? "10" : "100000"}
                />
              </div>

              {/* Input: Giảm tối đa (chỉ khi giảm %) */}
              {formData.discountType === "percent" && (
                <div className="admin-form-group">
                  <label>Giảm tối đa (VNĐ)</label>
                  <input
                    type="number"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                    min="0"
                    placeholder="VD: 200000 (để trống = không giới hạn)"
                  />
                </div>
              )}

              {/* Input: Đơn hàng tối thiểu */}
              <div className="admin-form-group">
                <label>Đơn hàng tối thiểu (VNĐ)</label>
                <input
                  type="number"
                  value={formData.minOrderAmount}
                  onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                  min="0"
                  placeholder="0 (để trống = áp dụng mọi đơn)"
                />
              </div>

              {/* Input: Số lượng mã */}
              <div className="admin-form-group">
                <label>Số lượng mã có thể sử dụng</label>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  min="1"
                  placeholder="Để trống = không giới hạn"
                />
              </div>

              {/* Input: Ngày bắt đầu */}
              <div className="admin-form-group">
                <label>Ngày bắt đầu</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              {/* Input: Ngày kết thúc */}
              <div className="admin-form-group">
                <label>Ngày kết thúc <span className="required">*</span></label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>

              {/* Toggle: Bật/tắt */}
              <div className="admin-form-group">
                <label>Trạng thái</label>
                <div style={{ display: "flex", gap: "12px", alignItems: "center", padding: "10px 0" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.85rem" }}>
                    <input type="radio" checked={formData.isActive} onChange={() => setFormData({ ...formData, isActive: true })} />
                    Hoạt động
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.85rem" }}>
                    <input type="radio" checked={!formData.isActive} onChange={() => setFormData({ ...formData, isActive: false })} />
                    Tắt
                  </label>
                </div>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="admin-form-actions">
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
                ← Hủy bỏ
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? (
                  <><span className="spinner spinner-dark"></span> Đang xử lý...</>
                ) : (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <Icon name="checkCircle" size={16} />
                    {editingCoupon ? "Lưu thay đổi" : "Tạo mã giảm giá"}
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==================== BẢNG DANH SÁCH MÃ GIẢM GIÁ ==================== */}
      {!showForm && (
        <>
          {/* Thanh hành động */}
          <div className="admin-page-actions">
            <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
              {coupons.length} mã giảm giá
            </span>
            <button className="btn btn-primary" onClick={openCreate}>
              Tạo mã giảm giá mới
            </button>
          </div>

          {/* Bảng dữ liệu */}
          <div className="admin-table-wrapper">
            {loading ? (
              <div className="admin-loading">
                <div className="spinner spinner-large spinner-dark"></div>
                <p>Đang tải mã giảm giá...</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Chiến dịch</th>
                    <th>Giá trị giảm</th>
                    <th>Đơn tối thiểu</th>
                    <th>Đã dùng / Giới hạn</th>
                    <th>Thời gian</th>
                    <th>Trạng thái</th>
                    <th style={{ width: "150px" }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => {
                    const status = getCouponStatus(coupon);
                    return (
                      <tr key={coupon._id}>
                        {/* Mã coupon */}
                        <td>
                          <code style={{
                            background: "#eff6ff", color: "#3b82f6",
                            padding: "4px 10px", borderRadius: "6px",
                            fontSize: "0.85rem", fontWeight: "700",
                            letterSpacing: "0.05em", border: "1px solid #bfdbfe"
                          }}>
                            {coupon.code}
                          </code>
                        </td>

                        {/* Tên chiến dịch */}
                        <td style={{ fontWeight: "600", color: "#1e293b" }}>
                          {coupon.name}
                        </td>

                        {/* Giá trị giảm */}
                        <td>
                          <span style={{ fontWeight: "700", color: "#ef4444" }}>
                            {coupon.discountType === "percent"
                              ? `-${coupon.discountValue}%`
                              : `-${coupon.discountValue?.toLocaleString("vi-VN")}đ`}
                          </span>
                          {coupon.discountType === "percent" && coupon.maxDiscountAmount && (
                            <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                              Tối đa: {coupon.maxDiscountAmount?.toLocaleString("vi-VN")}đ
                            </div>
                          )}
                        </td>

                        {/* Đơn hàng tối thiểu */}
                        <td style={{ color: "#64748b", fontSize: "0.83rem" }}>
                          {coupon.minOrderAmount > 0
                            ? `${coupon.minOrderAmount?.toLocaleString("vi-VN")}đ`
                            : "—"}
                        </td>

                        {/* Đã sử dụng / Giới hạn */}
                        <td style={{ textAlign: "center" }}>
                          <span className="badge badge-level">
                            {coupon.usageCount || 0}
                            {coupon.usageLimit ? ` / ${coupon.usageLimit}` : " / ∞"}
                          </span>
                        </td>

                        {/* Thời gian hiệu lực */}
                        <td style={{ fontSize: "0.78rem", color: "#64748b" }}>
                          <div>{formatDate(coupon.startDate)}</div>
                          <div style={{ color: "#94a3b8" }}>→ {formatDate(coupon.endDate)}</div>
                        </td>

                        {/* Trạng thái */}
                        <td>
                          <span className={`badge-status ${status.cls}`}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                              {status.icon ? <Icon name={status.icon} size={14} /> : null}
                              {status.label}
                            </span>
                          </span>
                        </td>

                        {/* Hành động */}
                        <td>
                          <button className="btn-action btn-edit" onClick={() => openEdit(coupon)} title="Sửa">
                            Sửa
                          </button>
                          <button className="btn-action btn-delete" onClick={() => handleDelete(coupon._id, coupon.code)} title="Xóa">
                            Xóa
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {coupons.length === 0 && (
                    <tr>
                      <td colSpan="8" className="admin-empty-cell">
                        Chưa có mã giảm giá nào. Bấm "Tạo mã giảm giá mới"!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
}
