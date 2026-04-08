// ================================================
// PAGE: AdminCategories - Quản lý danh mục khóa học (Admin)
// Mô tả: CRUD danh mục - Thêm, sửa, xóa, bật/tắt danh mục
// FEATURE 22, 23, 24: Tạo / Sửa / Xóa / Toggle danh mục
// ================================================
import { useState, useEffect } from "react";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/categoryService";
import AdminLayout from "../../components/AdminLayout";
import Icon from "../../components/Icon";

export default function AdminCategories() {
  // ================================================
  // STATE QUẢN LÝ DỮ LIỆU
  // ================================================
  const [categories, setCategories] = useState([]);    // Danh sách danh mục
  const [loading, setLoading] = useState(true);      // Loading khi tải dữ liệu
  const [submitting, setSubmitting] = useState(false); // Loading khi submit form
  const [showForm, setShowForm] = useState(false);   // Hiện/ẩn form
  const [editingCat, setEditingCat] = useState(null); // null = tạo mới, object = sửa

  // ================================================
  // STATE FORM DATA: Dữ liệu form nhập liệu
  // ================================================
  const [formData, setFormData] = useState({
    name: "",          // Tên danh mục
    description: "",   // Mô tả
    icon: "fas fa-folder", // Icon (FontAwesome class)
    color: "#3b82f6",  // Mã màu HEX
    order: 0,          // Thứ tự hiển thị
    isActive: true,    // Bật/tắt hiển thị
  });

  // ================================================
  // STATE THÔNG BÁO
  // ================================================
  const [message, setMessage] = useState({ type: "", text: "" });

  // ================================================
  // EFFECT: Load danh mục khi component mount
  // ================================================
  useEffect(() => {
    fetchCategories();
  }, []);

  // ================================================
  // HÀM: Gọi API lấy tất cả danh mục
  // ================================================
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await getAllCategories();
      if (res.data.success) setCategories(res.data.data);
    } catch (err) {
      console.error("Lỗi tải danh mục:", err);
      showMessage("error", "Không thể tải danh mục");
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
  // HÀM: Mở form tạo danh mục mới
  // ================================================
  const openCreate = () => {
    setEditingCat(null);
    setFormData({
      name: "",
      description: "",
      icon: "fas fa-folder",
      color: "#3b82f6",
      order: categories.length + 1,
      isActive: true,
    });
    setShowForm(true);
    setMessage({ type: "", text: "" });
  };

  // ================================================
  // HÀM: Mở form sửa danh mục
  // FEATURE 23: Cập nhật danh mục
  // ================================================
  const openEdit = (cat) => {
    setEditingCat(cat);
    setFormData({
      name: cat.name || "",
      description: cat.description || "",
      icon: cat.icon || "fas fa-folder",
      color: cat.color || "#3b82f6",
      order: cat.order || 0,
      isActive: cat.isActive !== false,
    });
    setShowForm(true);
    setMessage({ type: "", text: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ================================================
  // HÀM: Xử lý submit form (tạo mới / cập nhật)
  // ================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let res;
      if (editingCat) {
        // ================================================
        // FEATURE 23: Cập nhật danh mục
        // PUT /api/categories/:categoryId
        // ================================================
        res = await updateCategory(editingCat._id, formData);
      } else {
        // ================================================
        // FEATURE 22: Tạo danh mục mới
        // POST /api/categories
        // ================================================
        res = await createCategory(formData);
      }

      if (res.data.success) {
        showMessage(
          "success",
          editingCat ? "Cập nhật danh mục thành công!" : "Tạo danh mục mới thành công!"
        );
        fetchCategories();
        setTimeout(() => {
          setShowForm(false);
          setEditingCat(null);
        }, 1500);
      }
    } catch (err) {
      showMessage("error", err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  // ================================================
  // HÀM: Xóa danh mục (yêu cầu xác nhận)
  // FEATURE 24: Xóa danh mục
  // ================================================
  const handleDelete = async (catId, name) => {
    if (!window.confirm(`Xóa danh mục "${name}"?\n\nHành động này không thể hoàn tác!`)) return;
    try {
      // ================================================
      // FEATURE 24: Xóa danh mục
      // DELETE /api/categories/:categoryId
      // ================================================
      const res = await deleteCategory(catId);
      if (res.data.success) {
        showMessage("success", "Đã xóa danh mục thành công!");
        setCategories((prev) => prev.filter((c) => c._id !== catId));
      }
    } catch (err) {
      showMessage("error", err.response?.data?.message || "Lỗi khi xóa danh mục");
    }
  };

  return (
    <AdminLayout
      title="Quản lý Danh mục"
      subtitle="CRUD danh mục phân loại khóa học - Thêm, sửa, xóa và sắp xếp"
    >
      {/* ==================== THÔNG BÁO ==================== */}
      {message.text && (
        <div className={`message-box ${message.type}`}>{message.text}</div>
      )}

      {/* ==================== FORM TẠO / SỬA DANH MỤC ==================== */}
      {showForm && (
        <div className="admin-form-card">
          <h2>{editingCat ? "Sửa danh mục" : "Thêm danh mục mới"}</h2>

          <form onSubmit={handleSubmit}>
            <div className="admin-form-grid">
              {/* Input: Tên danh mục */}
              <div className="admin-form-group">
                <label>Tên danh mục <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="VD: Frontend, Backend, DevOps..."
                />
              </div>

              {/* Input: Thứ tự hiển thị */}
              <div className="admin-form-group">
                <label>Thứ tự hiển thị</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                  min="0"
                  placeholder="1"
                />
              </div>

              {/* Input: Chọn màu sắc */}
              <div className="admin-form-group">
                <label>Màu sắc danh mục</label>
                {/* Hai input: color picker + text để nhập hex */}
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    style={{ width: "46px", height: "38px", padding: "3px", cursor: "pointer", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="#3b82f6"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              {/* Toggle: Bật/tắt danh mục */}
              <div className="admin-form-group">
                <label>Trạng thái</label>
                <div style={{ display: "flex", gap: "12px", alignItems: "center", padding: "10px 0" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.85rem" }}>
                    <input
                      type="radio"
                      checked={formData.isActive === true}
                      onChange={() => setFormData({ ...formData, isActive: true })}
                    />
                    Hoạt động
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.85rem" }}>
                    <input
                      type="radio"
                      checked={formData.isActive === false}
                      onChange={() => setFormData({ ...formData, isActive: false })}
                    />
                    Tắt
                  </label>
                </div>
              </div>

              {/* Textarea: Mô tả (full width) */}
              <div className="admin-form-group full-width">
                <label>Mô tả danh mục</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="Mô tả ngắn về danh mục này..."
                />
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
                    {editingCat ? "Lưu thay đổi" : "Tạo danh mục"}
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==================== BẢNG DANH SÁCH DANH MỤC ==================== */}
      {!showForm && (
        <>
          {/* Thanh hành động */}
          <div className="admin-page-actions">
            <div>
              {/* Thống kê số danh mục */}
              <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                {categories.length} danh mục
              </span>
            </div>
            <button className="btn btn-primary" onClick={openCreate}>
              Thêm danh mục mới
            </button>
          </div>

          {/* Bảng dữ liệu */}
          <div className="admin-table-wrapper">
            {loading ? (
              <div className="admin-loading">
                <div className="spinner spinner-large spinner-dark"></div>
                <p>Đang tải danh mục...</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: "50px" }}>#</th>
                    <th>Tên danh mục</th>
                    <th>Slug</th>
                    <th>Màu</th>
                    <th>Mô tả</th>
                    <th>SL Khóa học</th>
                    <th>Thứ tự</th>
                    <th>Trạng thái</th>
                    <th style={{ width: "150px" }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {categories
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((cat, idx) => (
                      <tr key={cat._id}>
                        {/* Số thứ tự */}
                        <td style={{ textAlign: "center", color: "#94a3b8", fontWeight: "600" }}>
                          {idx + 1}
                        </td>

                        {/* Tên + icon màu */}
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{
                              width: "12px", height: "12px", borderRadius: "3px",
                              backgroundColor: cat.color || "#3b82f6", flexShrink: 0
                            }} />
                            <strong style={{ color: "#1e293b" }}>{cat.name}</strong>
                          </div>
                        </td>

                        {/* Slug */}
                        <td>
                          <code style={{
                            background: "#f1f5f9", padding: "2px 8px",
                            borderRadius: "4px", fontSize: "0.78rem", color: "#64748b"
                          }}>
                            {cat.slug}
                          </code>
                        </td>

                        {/* Màu sắc */}
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <div style={{
                              width: "24px", height: "24px", borderRadius: "6px",
                              backgroundColor: cat.color || "#3b82f6",
                              border: "1px solid #e2e8f0"
                            }} />
                            <span style={{ fontSize: "0.78rem", color: "#64748b", fontFamily: "monospace" }}>
                              {cat.color || "#3b82f6"}
                            </span>
                          </div>
                        </td>

                        {/* Mô tả */}
                        <td style={{ maxWidth: "200px" }}>
                          <span style={{ fontSize: "0.83rem", color: "#64748b" }}>
                            {cat.description?.length > 60
                              ? cat.description.slice(0, 60) + "..."
                              : cat.description || "—"}
                          </span>
                        </td>

                        {/* Số khóa học */}
                        <td style={{ textAlign: "center" }}>
                          <span className="badge badge-level">{cat.courseCount || 0}</span>
                        </td>

                        {/* Thứ tự */}
                        <td style={{ textAlign: "center", color: "#94a3b8" }}>
                          {cat.order || 0}
                        </td>

                        {/* Trạng thái */}
                        <td>
                          <span className={`badge-status ${cat.isActive !== false ? "badge-published" : "badge-draft"}`}>
                            {cat.isActive !== false ? "Hoạt động" : "Tắt"}
                          </span>
                        </td>

                        {/* Hành động */}
                        <td>
                          <button className="btn-action btn-edit" onClick={() => openEdit(cat)} title="Sửa">
                            Sửa
                          </button>
                          <button className="btn-action btn-delete" onClick={() => handleDelete(cat._id, cat.name)} title="Xóa">
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}

                  {categories.length === 0 && (
                    <tr>
                      <td colSpan="9" className="admin-empty-cell">
                        Chưa có danh mục nào. Bấm "Thêm danh mục mới" để bắt đầu!
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
