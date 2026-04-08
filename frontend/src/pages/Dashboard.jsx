// ================================================
// PAGE: Dashboard - Trang chủ sau khi đăng nhập
// Mô tả: Trang tổng quan dành cho user đã đăng nhập
// Hiển thị thông tin user, khóa học nổi bật, quick links
// ================================================
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUser } from "../services/authService";
import { getAllCourses } from "../services/courseService";
import Icon from "../components/Icon";
import "../styles/dashboard.css";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ================================================
  // FEATURE: Thêm vào giỏ hàng
  // ================================================
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
      return; // Silently abort without alerting
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
    // Không hiện pop up, để Navbar tự bắt event "storage"
    window.dispatchEvent(new Event("storage"));
  };

  // ================================================
  // FEATURE: Mua ngay
  // ================================================
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
      window.dispatchEvent(new Event("storage"));
    }
    navigate("/checkout");
  };

  // ================================================
  // Mount: lấy user info và khóa học nổi bật
  // ================================================
  useEffect(() => {
    const userData = getUser();
    setUser(userData);
    fetchFeaturedCourses();
  }, []);

  const fetchFeaturedCourses = async () => {
    try {
      const res = await getAllCourses({ limit: 6 });
      if (res.data.success) setFeaturedCourses(res.data.data);
    } catch (err) {
      console.error("Lỗi lấy khóa học:", err);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  return (
    <div className="dashboard-page">
      {/* ===== HERO SECTION ===== */}
      <div className="dashboard-hero">
        <div className="dashboard-hero-inner">
          <div>
            <div className="dashboard-greeting">
              {getGreeting()}, <span className="user-greeting-name">{user?.name}!</span>
            </div>
            <h1 className="dashboard-title">
              Sẵn Sàng Học Tiếp?
            </h1>
            <p className="dashboard-subtitle">
              Tiếp tục hành trình học tập của bạn với hàng trăm khóa học chất lượng cao.
            </p>
            <div className="dashboard-quick-actions">
              <Link to="/courses" className="btn btn-primary">
                <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
                  <Icon name="search" size={18} /> Khám phá khóa học
                </span>
              </Link>
              <Link to="/my-learning" className="btn btn-outline">
                <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
                  <Icon name="star" size={18} /> Khóa học của tôi
                </span>
              </Link>
            </div>
          </div>

          {/* Hình minh họa */}
          <div style={{ flexShrink: 0 }}>
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&q=80"
              alt="Học tập"
              style={{
                width: "240px",
                borderRadius: "16px",
                boxShadow: "0 8px 24px rgba(59, 130, 246, 0.15)",
              }}
            />
          </div>
        </div>
      </div>

      {/* ===== STATS ===== */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon"><Icon name="star" size={22} /></div>
          <div className="stat-info">
            <h3>200+</h3>
            <p>Khóa học</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Icon name="users" size={22} /></div>
          <div className="stat-info">
            <h3>50,000+</h3>
            <p>Học viên</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Icon name="star" size={22} /></div>
          <div className="stat-info">
            <h3>4.9/5</h3>
            <p>Đánh giá</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Icon name="user" size={22} /></div>
          <div className="stat-info">
            <h3>100+</h3>
            <p>Giảng viên</p>
          </div>
        </div>
      </div>

      {/* ===== KHÓA HỌC NỔI BẬT ===== */}
      <div className="dashboard-courses">
        <div className="section-header">
          <h2>Khóa học nổi bật</h2>
          <Link to="/courses" className="see-all-link">
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              Xem tất cả <Icon name="chevronRight" size={16} />
            </span>
          </Link>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner spinner-large"></div>
          </div>
        ) : (
          <div className="courses-grid">
            {featuredCourses.slice(0, 6).map((course) => (
              <Link
                to={`/courses/${course.slug}`}
                className="course-card"
                key={course._id}
              >
                <img
                  src={course.image}
                  alt={course.title}
                  className="course-image"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80";
                  }}
                />
                <div className="course-content">
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    <span
                      className="course-badge"
                      style={{
                        background: course.category?.color ? `${course.category.color}15` : "#eff6ff",
                        color: course.category?.color || "#3b82f6",
                      }}
                    >
                      {course.category?.name || "Lập trình"}
                    </span>
                    <span className="course-level">{course.level}</span>
                  </div>
                  <h3 className="course-card-title">{course.title}</h3>
                  <p className="course-card-desc">{course.description}</p>
                  <div className="course-footer">
                    <span className="course-price">
                      {course.discountPrice ? (
                        <>
                          <span className="price-old">
                            {course.price.toLocaleString("vi-VN")}đ
                          </span>
                          <span className="price-sale">
                            {course.discountPrice.toLocaleString("vi-VN")}đ
                          </span>
                        </>
                      ) : course.price === 0 ? (
                        <span className="price-free">Miễn phí</span>
                      ) : (
                        <span className="price-normal">
                          {course.price.toLocaleString("vi-VN")}đ
                        </span>
                      )}
                    </span>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <Icon name="users" size={14} /> {course.enrolledCount?.toLocaleString() || 0}
                    </span>
                  </div>
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
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ===== QUICK LINKS ===== */}
      <div className="dashboard-links">
        <div className="quick-link-card">
          <span className="link-icon"><Icon name="heart" size={18} /></span>
          <h3>Danh sách yêu thích</h3>
          <p>Các khóa học bạn đã lưu</p>
          <Link to="/wishlist" className="btn btn-outline btn-sm">Truy cập</Link>
        </div>
        <div className="quick-link-card">
          <span className="link-icon"><Icon name="clock" size={18} /></span>
          <h3>Đơn hàng</h3>
          <p>Lịch sử mua hàng</p>
          <Link to="/my-orders" className="btn btn-outline btn-sm">Truy cập</Link>
        </div>
        <div className="quick-link-card">
          <span className="link-icon"><Icon name="user" size={18} /></span>
          <h3>Hồ sơ cá nhân</h3>
          <p>Cập nhật thông tin của bạn</p>
          <Link to="/profile" className="btn btn-outline btn-sm">Truy cập</Link>
        </div>
      </div>
    </div>
  );
}
