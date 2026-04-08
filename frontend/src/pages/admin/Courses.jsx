// ================================================
// PAGE: AdminCourses - Quản lý khóa học (Admin)
// Mô tả: Danh sách tất cả khóa học, CRUD đầy đủ
// FEATURE 13, 14, 15: Tạo / Sửa / Xóa khóa học
// ================================================
import { useState, useEffect } from "react";
import { getAllCourses, createCourse, updateCourse, deleteCourse } from "../../services/courseService";
import { getAllCategories } from "../../services/categoryService";
import AdminLayout from "../../components/AdminLayout";
import Icon from "../../components/Icon";

export default function AdminCourses() {
  // ================================================
  // STATE QUẢN LÝ DỮ LIỆU
  // ================================================
  const [courses, setCourses] = useState([]);           // Danh sách khóa học
  const [categories, setCategories] = useState([]);    // Danh mục để chọn
  const [loading, setLoading] = useState(true);        // Trạng thái loading
  const [submitting, setSubmitting] = useState(false); // Đang submit form
  const [instructors, setInstructors] = useState([]); // Danh sách giảng viên

  // ================================================
  // STATE FORM: Mở form tạo mới HOẶC sửa
  // ================================================
  const [showForm, setShowForm] = useState(false);    // Hiện/ẩn form
  const [editingCourse, setEditingCourse] = useState(null); // null = tạo mới, object = sửa

  // ================================================
  // STATE FORM DATA: Dữ liệu form nhập liệu
  // ================================================
  const [formData, setFormData] = useState({
    title: "",           // Tiêu đề khóa học
    description: "",     // Mô tả chi tiết
    price: 0,            // Giá gốc (VNĐ)
    discountPrice: "",   // Giá khuyến mãi (để trống = không giảm)
    category: "",        // ID danh mục
    level: "Beginner",   // Cấp độ
    image: "",           // URL ảnh bìa
    status: "draft",     // Trạng thái: draft / published / archived
    tags: "",            // Tags: cách nhau bằng dấu phẩy
    prerequisites: "",   // Yêu cầu trước khi học
    prerequisites: "",   // Yêu cầu trước khi học
    whatYouLearn: "",    // Học được gì sau khóa học
    instructor: "",      // ID giảng viên
    authorName: "",      // Tên giảng viên hiển thị
  });

  // ================================================
  // STATE THÔNG BÁO & TÌM KIẾM
  // ================================================
  const [message, setMessage] = useState({ type: "", text: "" }); // Thông báo thành công/lỗi
  const [search, setSearch] = useState("");       // Từ khóa tìm kiếm
  const [filterStatus, setFilterStatus] = useState(""); // Lọc theo trạng thái
  const [filterCategory, setFilterCategory] = useState(""); // Lọc theo danh mục
  const [currentPage, setCurrentPage] = useState(1);     // Trang hiện tại
  const itemsPerPage = 10;                            // Số item / trang

  // ================================================
  // EFFECT: Load dữ liệu khi component mount
  // ================================================
  useEffect(() => {
    fetchData();
  }, []);

  // ================================================
  // HÀM: Lấy danh sách khóa học + danh mục từ API
  // ================================================
  const fetchData = async () => {
    setLoading(true);
    try {
      // Gọi song song 3 API để tối ưu thời gian
      const [coursesRes, categoriesRes, instructorsRes] = await Promise.all([
        getAllCourses({ limit: 100, status: "all" }),  // Admin can see draft/published/archived
        getAllCategories(),
        import("../../services/authService").then(m => m.getAllUsers({ role: "instructor", limit: 100 })),
      ]);
      if (coursesRes.data.success) setCourses(coursesRes.data.data);
      if (categoriesRes.data.success) setCategories(categoriesRes.data.data);
      if (instructorsRes.data.success) setInstructors(instructorsRes.data.data);
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
      showMessage("error", "Không thể tải dữ liệu khóa học");
    } finally {
      setLoading(false);
    }
  };

  // ================================================
  // HÀM: Hiện thông báo (success/error)
  // ================================================
  const showMessage = (type, text) => {
    setMessage({ type, text });
    // Tự động ẩn sau 4 giây
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  // ================================================
  // HÀM: Reset form về trạng thái rỗng (tạo mới)
  // ================================================
  const openCreateForm = () => {
    setEditingCourse(null);
    setFormData({
      title: "", description: "", price: 0, discountPrice: "",
      category: categories[0]?._id || "", level: "Beginner", image: "",
      status: "draft", tags: "", prerequisites: "", whatYouLearn: "",
      instructor: "", authorName: "",
    });
    setShowForm(true);
    setMessage({ type: "", text: "" });
  };

  // ================================================
  // HÀM: Mở form sửa với dữ liệu khóa học hiện có
  // FEATURE 14: Cập nhật khóa học
  // ================================================
  const openEditForm = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title || "",
      description: course.description || "",
      price: course.price || 0,
      discountPrice: course.discountPrice || "",
      category: course.category?._id || course.category || "",
      level: course.level || "Beginner",
      image: course.image || "",
      status: course.status || "draft",
      tags: course.tags?.join(", ") || "",
      prerequisites: course.prerequisites || "",
      whatYouLearn: course.whatYouLearn || "",
      instructor: course.instructor?._id || course.instructor || "",
      authorName: course.authorName || "",
    });
    setShowForm(true);
    setMessage({ type: "", text: "" });
    // Scroll lên đầu trang để thấy form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ================================================
  // HÀM: Xử lý submit form (tạo mới HOẶC cập nhật)
  // ================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      // Chuẩn bị dữ liệu gửi lên server
      const submitData = {
        ...formData,
        price: Number(formData.price) || 0,
        // Nếu có giá khuyến mãi -> chuyển thành số, không có -> null
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
        // Chuyển tags từ chuỗi "react, js, frontend" -> mảng ["react", "js", "frontend"]
        tags: formData.tags
          ? formData.tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
          : [],
      };

      let res;
      if (editingCourse) {
        // ================================================
        // FEATURE 14: Cập nhật khóa học hiện có
        // PUT /api/courses/:courseId
        // ================================================
        res = await updateCourse(editingCourse._id, submitData);
      } else {
        // ================================================
        // FEATURE 13: Tạo khóa học mới
        // POST /api/courses
        // ================================================
        res = await createCourse(submitData);
      }

      if (res.data.success) {
        showMessage(
          "success",
          editingCourse ? "Cập nhật khóa học thành công!" : "Tạo khóa học mới thành công!"
        );
        // Tải lại danh sách sau khi thành công
        fetchData();
        // Đóng form sau 1.5 giây
        setTimeout(() => {
          setShowForm(false);
          setEditingCourse(null);
        }, 1500);
      }
    } catch (err) {
      showMessage("error", err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setSubmitting(false);
    }
  };

  // ================================================
  // HÀM: Xóa khóa học (yêu cầu xác nhận trước)
  // FEATURE 15: Xóa khóa học
  // ================================================
  const handleDelete = async (courseId, title) => {
    // Hộp thoại xác nhận trước khi xóa
    if (!window.confirm(`Bạn có chắc muốn xóa khóa học "${title}"?\n\nHành động này không thể hoàn tác!`)) {
      return;
    }

    try {
      // ================================================
      // FEATURE 15: Xóa khóa học
      // DELETE /api/courses/:courseId
      // ================================================
      const res = await deleteCourse(courseId);
      if (res.data.success) {
        showMessage("success", "Đã xóa khóa học thành công!");
        // Cập nhật lại danh sách (không cần gọi API lại)
        setCourses((prev) => prev.filter((c) => c._id !== courseId));
      }
    } catch (err) {
      showMessage("error", err.response?.data?.message || "Lỗi khi xóa khóa học");
    }
  };

  // ================================================
  // HÀM: Lọc danh sách khóa học theo search + status
  // ================================================
  const getFilteredCourses = () => {
    return courses.filter((course) => {
      // Lọc theo từ khóa tìm kiếm (tiêu đề)
      const matchSearch = !search ||
        course.title?.toLowerCase().includes(search.toLowerCase());
      // Lọc theo trạng thái
      const matchStatus = !filterStatus || course.status === filterStatus;
      // Lọc theo danh mục
      const matchCategory = !filterCategory ||
        (course.category?._id || course.category) === filterCategory;
      return matchSearch && matchStatus && matchCategory;
    });
  };

  const filteredCourses = getFilteredCourses();

  // ================================================
  // HÀM: Phân trang - lấy khóa học trang hiện tại
  // ================================================
  const getPaginatedCourses = () => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCourses.slice(start, start + itemsPerPage);
  };

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  // ================================================
  // HÀM: Đóng form, quay về danh sách
  // ================================================
  const closeForm = () => {
    setShowForm(false);
    setEditingCourse(null);
    setMessage({ type: "", text: "" });
  };

  // ================================================
  // RENDER: Giao diện trang Admin Courses
  // ================================================
  return (
    <AdminLayout
      title="Quản lý Khóa học"
      subtitle="CRUD khóa học - Tạo, sửa, xóa và quản lý nội dung khóa học"
    >
      {/* ==================== THÔNG BÁO ==================== */}
      {/* Hiển thị thông báo thành công (xanh) hoặc lỗi (đỏ) */}
      {message.text && (
        <div className={`message-box ${message.type}`}>{message.text}</div>
      )}

      {/* ==================== FORM TẠO / SỬA KHÓA HỌC ==================== */}
      {showForm && (
        <div className="admin-form-card">
          {/* Tiêu đề form: "Tạo khóa học mới" HOẶC "Sửa khóa học" */}
          <h2>
            {editingCourse ? "Sửa khóa học" : "Tạo khóa học mới"}
          </h2>

          {/* Form nhập liệu */}
          <form onSubmit={handleSubmit}>
            {/* Lưới form: 2 cột */}
            <div className="admin-form-grid">
              {/* Input: Tiêu đề khóa học */}
              <div className="admin-form-group">
                <label>Tiêu đề khóa học <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="VD: ReactJS từ Zero đến Hero"
                />
              </div>

              {/* Select: Danh mục */}
              <div className="admin-form-group">
                <label>Danh mục <span className="required">*</span></label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Select: Giảng viên phụ trách */}
              <div className="admin-form-group">
                <label>Giảng viên phụ trách <span className="required">*</span></label>
                <select
                  value={formData.instructor}
                  onChange={(e) => {
                    const instId = e.target.value;
                    const inst = instructors.find(i => i._id === instId);
                    setFormData({ 
                      ...formData, 
                      instructor: instId,
                      authorName: inst ? inst.name : formData.authorName 
                    });
                  }}
                  required
                >
                  <option value="">-- Chọn giảng viên --</option>
                  {instructors.map((ins) => (
                    <option key={ins._id} value={ins._id}>{ins.name} ({ins.email})</option>
                  ))}
                  {/* Trường hợp admin muốn tự gán hoặc instructor khác chưa load kịp */}
                  <option value="custom">-- Khác (Tự nhập tên) --</option>
                </select>
              </div>

              {/* Input: Tên giảng viên hiển thị */}
              <div className="admin-form-group">
                <label>Tên giảng viên hiển thị</label>
                <input
                  type="text"
                  value={formData.authorName}
                  onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                  placeholder="VD: Nguyễn Văn A"
                />
              </div>

              {/* Input: Giá gốc */}
              <div className="admin-form-group">
                <label>Giá gốc (VNĐ) <span className="required">*</span></label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  min="0"
                  placeholder="799000"
                />
              </div>

              {/* Input: Giá khuyến mãi */}
              <div className="admin-form-group">
                <label>Giá khuyến mãi (VNĐ)</label>
                <input
                  type="number"
                  value={formData.discountPrice}
                  onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                  min="0"
                  placeholder="499000 (để trống = không giảm giá)"
                />
              </div>

              {/* Select: Cấp độ */}
              <div className="admin-form-group">
                <label>Cấp độ</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                >
                  <option value="Beginner">Beginner - Mới bắt đầu</option>
                  <option value="Intermediate">Intermediate - Trung cấp</option>
                  <option value="Advanced">Advanced - Nâng cao</option>
                  <option value="All Levels">All Levels - Mọi cấp độ</option>
                </select>
              </div>

              {/* Select: Trạng thái */}
              <div className="admin-form-group">
                <label>Trạng thái</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="draft">Nháp - Chưa công khai</option>
                  <option value="published">Công khai - Hiển thị cho học viên</option>
                  <option value="archived">Lưu trữ - Ẩn khỏi danh sách</option>
                </select>
              </div>

              {/* Input: URL Ảnh bìa (full width) */}
              <div className="admin-form-group full-width">
                <label>URL Ảnh bìa</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                />
              </div>

              {/* Input: Tags (full width) */}
              <div className="admin-form-group full-width">
                <label>Tags (phân cách bằng dấu phẩy)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="react, javascript, frontend, web development"
                />
              </div>

              {/* Textarea: Yêu cầu trước khi học (full width) */}
              <div className="admin-form-group full-width">
                <label>Yêu cầu trước khi học</label>
                <textarea
                  value={formData.prerequisites}
                  onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
                  rows={2}
                  placeholder="VD: Có kiến thức cơ bản về HTML, CSS và JavaScript"
                />
              </div>

              {/* Textarea: Mô tả chi tiết (full width) */}
              <div className="admin-form-group full-width">
                <label>Mô tả chi tiết <span className="required">*</span></label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  placeholder="Mô tả chi tiết về nội dung, lợi ích và đối tượng phù hợp của khóa học..."
                />
              </div>

              {/* Textarea: Học được gì (full width) */}
              <div className="admin-form-group full-width">
                <label>Học viên sẽ học được gì?</label>
                <textarea
                  value={formData.whatYouLearn}
                  onChange={(e) => setFormData({ ...formData, whatYouLearn: e.target.value })}
                  rows={3}
                  placeholder="Mỗi dòng là một điểm chính, ví dụ:\n- Xây dựng ứng dụng web với React\n- Quản lý state với Redux Toolkit"
                />
              </div>
            </div>

            {/* Nút hành động: Hủy + Lưu */}
            <div className="admin-form-actions">
              <button type="button" className="btn btn-outline" onClick={closeForm}>
                ← Hủy bỏ
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? (
                  <><span className="spinner spinner-dark"></span> Đang xử lý...</>
                ) : editingCourse ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <Icon name="checkCircle" size={16} />
                    Lưu thay đổi
                  </span>
                ) : (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <Icon name="checkCircle" size={16} />
                    Tạo khóa học
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==================== BẢNG DANH SÁCH KHÓA HỌC ==================== */}
      {!showForm && (
        <>
          {/* Thanh hành động: Tạo mới + Bộ lọc */}
          <div className="admin-page-actions">
            {/* Bộ lọc bên trái */}
            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
              {/* Input tìm kiếm */}
              <input
                type="text"
                className="admin-table-search"
                placeholder="Tìm kiếm khóa học..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              />
              {/* Select lọc danh mục */}
              <select
                className="admin-table-filter-select"
                value={filterCategory}
                onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              {/* Select lọc trạng thái */}
              <select
                className="admin-table-filter-select"
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="published">Công khai</option>
                <option value="draft">Nháp</option>
                <option value="archived">Lưu trữ</option>
              </select>
            </div>

            {/* Nút tạo mới bên phải */}
            <button className="btn btn-primary" onClick={openCreateForm}>
              Tạo khóa học mới
            </button>
          </div>

          {/* Bảng dữ liệu */}
          <div className="admin-table-wrapper">
            {/* Loading state */}
            {loading ? (
              <div className="admin-loading">
                <div className="spinner spinner-large spinner-dark"></div>
                <p>Đang tải danh sách khóa học...</p>
              </div>
            ) : (
              <>
                <table className="admin-table">
                  {/* Header bảng */}
                  <thead>
                    <tr>
                      <th style={{ width: "60px" }}>Ảnh</th>
                      <th>Tiêu đề khóa học</th>
                      <th>Danh mục</th>
                      <th>Giá</th>
                      <th>Cấp độ</th>
                      <th>Học viên</th>
                      <th>Trạng thái</th>
                      <th style={{ width: "150px" }}>Hành động</th>
                    </tr>
                  </thead>

                  {/* Body bảng */}
                  <tbody>
                    {getPaginatedCourses().map((course) => (
                      <tr key={course._id}>
                        {/* Ảnh thumbnail */}
                        <td>
                          <img
                            src={course.image || "https://via.placeholder.com/60x40?text=KH"}
                            alt={course.title}
                            className="admin-table-thumb"
                            onError={(e) => { e.target.src = "https://via.placeholder.com/60x40?text=KH"; }}
                          />
                        </td>

                        {/* Tiêu đề + mô tả ngắn */}
                        <td>
                          <div className="admin-course-cell">
                            <div className="admin-course-cell-title">{course.title}</div>
                            <div className="admin-course-cell-cat">
                              {course.isFeatured ? "Nổi bật" : ""} {course.level} • {course.authorName || "Ẩn danh"}
                            </div>
                          </div>
                        </td>

                        {/* Danh mục */}
                        <td>
                          <span className="badge badge-level" style={{ background: course.category?.color ? `${course.category.color}15` : "", color: course.category?.color || "" }}>
                            {course.category?.name || "—"}
                          </span>
                        </td>

                        {/* Giá */}
                        <td>
                          {course.discountPrice ? (
                            <div>
                              <span className="admin-price-old">
                                {course.price.toLocaleString("vi-VN")}đ
                              </span>
                              <span className="admin-price-sale">
                                {Number(course.discountPrice).toLocaleString("vi-VN")}đ
                              </span>
                            </div>
                          ) : course.price === 0 ? (
                            <span className="admin-price-free">Miễn phí</span>
                          ) : (
                            <span className="admin-price-normal">
                              {course.price.toLocaleString("vi-VN")}đ
                            </span>
                          )}
                        </td>

                        {/* Cấp độ */}
                        <td>
                          <span className={`badge badge-level badge-${course.level?.toLowerCase()}`}>
                            {course.level}
                          </span>
                        </td>

                        {/* Số học viên */}
                        <td style={{ textAlign: "center" }}>
                          <strong>{course.enrolledCount || 0}</strong>
                        </td>

                        {/* Trạng thái */}
                        <td>
                          <span className={`badge-status badge-${course.status}`}>
                            {course.status === "published" ? "Công khai" :
                             course.status === "draft" ? "Nháp" : "Lưu trữ"}
                          </span>
                        </td>

                        {/* Nút hành động: Sửa + Xóa */}
                        <td>
                          <button
                            className="btn-action btn-edit"
                            onClick={() => openEditForm(course)}
                            title="Sửa khóa học"
                          >
                            Sửa
                          </button>
                          <button
                            className="btn-action btn-delete"
                            onClick={() => handleDelete(course._id, course.title)}
                            title="Xóa khóa học"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}

                    {/* Cell trống khi không có dữ liệu */}
                    {getPaginatedCourses().length === 0 && (
                      <tr>
                        <td colSpan="8" className="admin-empty-cell">
                          Không tìm thấy khóa học nào phù hợp
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Phân trang */}
                {!loading && totalPages > 1 && (
                  <div className="admin-pagination">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      ← Trước
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                      .reduce((acc, p, idx, arr) => {
                        if (idx > 0 && arr[idx - 1] !== p - 1) acc.push("...");
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, idx) =>
                        p === "..." ? (
                          <span key={`ellipsis-${idx}`} style={{ padding: "6px 8px", color: "#64748b" }}>…</span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setCurrentPage(p)}
                            className={currentPage === p ? "active" : ""}
                          >
                            {p}
                          </button>
                        )
                      )}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        Sau <Icon name="chevronRight" size={16} />
                      </span>
                    </button>
                  </div>
                )}

                {/* Thống kê số dòng */}
                {!loading && (
                  <div style={{ padding: "12px 16px", fontSize: "0.8rem", color: "#64748b", borderTop: "1px solid #e2e8f0" }}>
                    Hiển thị {getPaginatedCourses().length} / {filteredCourses.length} khóa học
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
}

