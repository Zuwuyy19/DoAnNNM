// ================================================
// PAGE: CourseList - Trang danh sách khóa học
// Mô tả: Hiển thị, tìm kiếm, lọc và phân trang khóa học
// FEATURE 11: Lấy danh sách khóa học với tìm kiếm, lọc
// ================================================
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllCourses, getMyEnrolledCourses } from "../../services/courseService";
import { getAllCategories } from "../../services/categoryService";
import { getUser } from "../../services/authService";
import "../../styles/course.css";

export default function CourseList() {
  // ================================================
  // STATE QUẢN LÝ DỮ LIỆU
  // ================================================
  const [courses, setCourses] = useState([]);        // Danh sách khóa học
  const [categories, setCategories] = useState([]); // Danh mục để lọc
  const [activeCategory, setActiveCategory] = useState(""); // ID danh mục đang chọn
  const [loading, setLoading] = useState(true);    // Loading khi tải dữ liệu
  const [page, setPage] = useState(1);              // Trang hiện tại
  const [totalPages, setTotalPages] = useState(1);  // Tổng số trang
  const [searchQuery, setSearchQuery] = useState(""); // Từ khóa tìm kiếm
  const [sortBy, setSortBy] = useState("-createdAt"); // Sắp xếp theo trường nào
  const [user] = useState(getUser());              // Thông tin user
  const [ownedCourseIds, setOwnedCourseIds] = useState(new Set()); // Các khóa đã sở hữu
  const navigate = useNavigate();

  // ================================================
  // EFFECT: Load danh sách khóa học đã sở hữu (nếu login)
  // ================================================
  useEffect(() => {
    const fetchOwned = async () => {
      if (!user) {
        setOwnedCourseIds(new Set());
        return;
      }
      try {
        const res = await getMyEnrolledCourses();
        if (res.data?.success && Array.isArray(res.data.data)) {
          setOwnedCourseIds(new Set(res.data.data.map((c) => c._id)));
        } else {
          setOwnedCourseIds(new Set());
        }
      } catch (err) {
        // Nếu token hết hạn / lỗi API thì coi như chưa có owned để không chặn trải nghiệm
        setOwnedCourseIds(new Set());
      }
    };
    fetchOwned();
  }, [user]);

  const handleAddToCart = (e, course) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate("/login");
      return;
    }
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (!Array.isArray(cart)) cart = [];
    if (cart.some((item) => (item._id || item.courseId) === course._id)) {
      return; // Silent abort
    }
    const cartItem = {
      _id: course._id,
      courseId: course._id,
      title: course.title,
      image: course.image,
      price: course.price,
      discountPrice: course.discountPrice || null,
      authorName: course.authorName || "Giảng viên",
      slug: course.slug,
    };
    cart.push(cartItem);
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Đã thêm vào giỏ hàng!");
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handleBuyNow = (e, course) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate("/login");
      return;
    }
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (!Array.isArray(cart)) cart = [];
    if (!cart.some((item) => (item._id || item.courseId) === course._id)) {
      const cartItem = {
        _id: course._id,
        courseId: course._id,
        title: course.title,
        image: course.image,
        price: course.price,
        discountPrice: course.discountPrice || null,
        authorName: course.authorName || "Giảng viên",
        slug: course.slug,
      };
      cart.push(cartItem);
      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cartUpdated"));
    }
    navigate("/checkout");
  };

  // ================================================
  // EFFECT: Load dữ liệu khi component mount
  // ================================================
  useEffect(() => {
    fetchCategories();
    fetchCourses();
  }, [activeCategory, page, sortBy]);

  // ================================================
  // HÀM: Lấy danh mục để hiển thị bộ lọc
  // ================================================
  const fetchCategories = async () => {
    try {
      const res = await getAllCategories();
      if (res.data.success) setCategories(res.data.data);
    } catch (error) {
      console.error("Lỗi lấy danh mục:", error);
    }
  };

  // ================================================
  // FEATURE 11: Lấy danh sách khóa học với tham số lọc
  // Query: category, search, sort, page, limit
  // ================================================
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        sort: sortBy,
      };
      // Thêm filter category nếu đang chọn danh mục
      if (activeCategory) params.category = activeCategory;
      // Thêm filter search nếu có từ khóa
      if (searchQuery.trim()) params.search = searchQuery;

      const res = await getAllCourses(params);
      if (res.data.success) {
        setCourses(res.data.data);
        setTotalPages(res.data.pages || 1);
      }
    } catch (error) {
      console.error("Lỗi lấy khóa học:", error);
    } finally {
      setLoading(false);
    }
  };

  // ================================================
  // HÀM: Lọc theo danh mục
  // ================================================
  const handleFilter = (categoryId) => {
    // Click vào danh mục đang active -> bỏ lọc (về "Tất cả")
    if (activeCategory === categoryId) {
      setActiveCategory("");
    } else {
      setActiveCategory(categoryId);
    }
    setPage(1); // Reset về trang 1 khi đổi bộ lọc
  };

  // ================================================
  // HÀM: Tìm kiếm với debounce 500ms
  // ================================================
  useEffect(() => {
    const timer = setTimeout(() => {
      // Chỉ gọi API khi thực sự có từ khóa
      if (searchQuery.trim()) {
        setPage(1);
        fetchCourses();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ================================================
  // HÀM: Submit form tìm kiếm (nút enter)
  // ================================================
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCourses();
  };

  // ================================================
  // HÀM: Định dạng giá tiền hiển thị
  // ================================================
  const formatPrice = (course) => {
    if (course.discountPrice) {
      return (
        <>
          <span className="price-old">
            {course.price.toLocaleString("vi-VN")}đ
          </span>
          <span className="price-sale">
            {Number(course.discountPrice).toLocaleString("vi-VN")}đ
          </span>
        </>
      );
    }
    if (course.price === 0) {
      return <span className="price-free">Miễn phí</span>;
    }
    return (
      <span className="price-normal">
        {course.price.toLocaleString("vi-VN")}đ
      </span>
    );
  };

  // ================================================
  // HÀM: Lấy màu badge danh mục từ dữ liệu backend
  // ================================================
  const getCategoryStyle = (category) => {
    if (!category?.color) {
      return { background: "#eff6ff", color: "#3b82f6" };
    }
    return {
      background: `${category.color}15`,
      color: category.color,
    };
  };

  // ================================================
  // RENDER: Giao diện trang danh sách khóa học
  // ================================================
  const visibleCourses = courses.filter((c) => !ownedCourseIds.has(c._id));

  return (
    <div className="courses-container">
      {/* ==================== HEADER ==================== */}
      {/* Tiêu đề + thanh tìm kiếm + bộ sắp xếp */}
      <div className="courses-header">
        {/* Tiêu đề trang */}
        <h1 className="courses-title">Khám Phá Các Khóa Học</h1>
        <p className="courses-subtitle">
          Nâng cao kỹ năng lập trình của bạn với các khóa học chất lượng cao
        </p>

        {/* Thanh tìm kiếm */}
        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            placeholder="Tìm kiếm khóa học..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </form>

        {/* Bộ sắp xếp */}
        <div className="sort-options">
          <span>Sắp xếp:</span>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
          >
            <option value="-createdAt">Mới nhất</option>
            <option value="-averageRating">Đánh giá cao</option>
            <option value="-enrolledCount">Phổ biến nhất</option>
            <option value="price">Giá: Thấp → Cao</option>
            <option value="-price">Giá: Cao → Thấp</option>
          </select>
        </div>
      </div>

      {/* ==================== BỘ LỌC DANH MỤC ==================== */}
      <div className="category-filters">
        {/* Nút "Tất cả" - bỏ lọc */}
        <button
          className={`filter-btn ${activeCategory === "" ? "active" : ""}`}
          onClick={() => handleFilter("")}
        >
          Tất cả
        </button>

        {/* Các nút danh mục */}
        {categories.map((cat) => (
          <button
            key={cat._id}
            className={`filter-btn ${activeCategory === cat._id ? "active" : ""}`}
            onClick={() => handleFilter(cat._id)}
          >
            {cat.name} ({cat.courseCount || 0})
          </button>
        ))}
      </div>

      {/* ==================== GRID KHÓA HỌC ==================== */}
      {loading ? (
        /* Trạng thái loading */
        <div className="loading-state">
          <div className="spinner spinner-large"></div>
          <p>Đang tải dữ liệu khóa học...</p>
        </div>
      ) : (
        <>
          {/* Grid hiển thị các card khóa học */}
          <div className="courses-grid">
            {visibleCourses.map((course) => (
              <div
                onClick={() => navigate(`/courses/${course.slug}`)}
                className="course-card"
                key={course._id}
                style={{ cursor: "pointer" }}
              >
                {/* Ảnh bìa khóa học */}
                <img
                  src={course.image}
                  alt={course.title}
                  className="course-image"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80";
                  }}
                />

                {/* Nội dung card */}
                <div className="course-content">
                  {/* Badge danh mục + cấp độ */}
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    <span
                      className="course-badge"
                      style={getCategoryStyle(course.category)}
                    >
                      {course.category?.name || "Lập trình"}
                    </span>
                    <span className="course-level">{course.level}</span>
                  </div>

                  {/* Tiêu đề khóa học */}
                  <h3 className="course-card-title">{course.title}</h3>

                  {/* Mô tả ngắn (giới hạn 2 dòng) */}
                  <p className="course-card-desc">{course.description}</p>

                  {/* Footer: Giá + Số học viên */}
                  <div className="course-footer">
                    <span className="course-price">
                      {formatPrice(course)}
                    </span>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      {course.enrolledCount?.toLocaleString() || 0}
                    </span>
                  </div>

                  {/* Hành động: Mua & Thêm giỏ hàng */}
                  <div className="course-card-actions" style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                    <button 
                      className="btn btn-primary" 
                      style={{ flex: 1, padding: "8px 0", fontSize: "0.85rem", borderRadius: "6px" }}
                      onClick={(e) => handleBuyNow(e, course)}
                    >
                       Mua ngay
                    </button>
                    <button 
                      className="btn btn-outline" 
                      style={{ flex: 1, padding: "8px 0", fontSize: "0.85rem", borderRadius: "6px" }}
                      onClick={(e) => handleAddToCart(e, course)}
                    >
                       Thêm giỏ hàng
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ==================== PHÂN TRANG ==================== */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-outline"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ← Trang trước
              </button>
              <span className="page-info">
                Trang {page} / {totalPages}
              </span>
              <button
                className="btn btn-outline"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Trang sau →
              </button>
            </div>
          )}

          {/* ==================== TRƯỜNG HỢP KHÔNG CÓ KHÓA HỌC ==================== */}
          {visibleCourses.length === 0 && (
            <div className="empty-state">
              <h3 style={{ color: "var(--text-primary)", marginBottom: "8px" }}>
                Không tìm thấy khóa học nào
              </h3>
              <p style={{ color: "var(--text-secondary)" }}>
                Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác.
              </p>
              <button
                className="btn btn-primary"
                style={{ marginTop: "16px" }}
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("");
                  setPage(1);
                }}
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}