// ================================================
// PAGE: Home - Trang chủ website bán khóa học
// Mô tả: Landing page chuyên nghiệp giao diện sáng
// NOTE: Navbar dùng chung đã được include từ App.jsx
// ================================================
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUser } from "../services/authService";
import { getAllCourses, getMyEnrolledCourses } from "../services/courseService";
import { getAllCategories } from "../services/categoryService";
import "../styles/home.css";

export default function Home() {
  const [user] = useState(getUser());
  const [categories, setCategories] = useState([]);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [ownedCourseIds, setOwnedCourseIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    // Dùng event để badge navbar cập nhật tự động (không alert)
    window.dispatchEvent(new Event("storage"));
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
      window.dispatchEvent(new Event("storage"));
    }
    navigate("/checkout");
  };

  // ================================================
  // EFFECT: Load dữ liệu khi component mount
  // ================================================
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const promises = [getAllCategories(), getAllCourses({ limit: 8 })];
      if (user) promises.push(getMyEnrolledCourses());

      const results = await Promise.all(promises);
      const catRes = results[0];
      const courseRes = results[1];
      const enrolledRes = user ? results[2] : null;

      if (catRes.data.success) setCategories(catRes.data.data);
      if (courseRes.data.success) setFeaturedCourses(courseRes.data.data);
      if (enrolledRes?.data?.success && Array.isArray(enrolledRes.data.data)) {
        setOwnedCourseIds(new Set(enrolledRes.data.data.map((c) => c._id)));
      } else {
        setOwnedCourseIds(new Set());
      }
    } catch (err) {
      console.error("Lỗi tải dữ liệu trang chủ:", err);
      setOwnedCourseIds(new Set());
    } finally {
      setLoading(false);
    }
  };

  // ================================================
  // Lấy lời chào theo thời gian trong ngày
  // ================================================
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  // ================================================
  // RENDER: Giao diện trang chủ
  // ================================================
  return (
    <div className="home-page">
      {/* ==================== HERO SECTION ==================== */}
      <section className="home-hero">
        <div className="home-hero-inner">
          {/* Nội dung bên trái */}
          <div className="hero-content">
            {/* Badge */}
            <div className="home-hero-badge">
              Nền tảng học lập trình hàng đầu
            </div>

            {/* Tiêu đề chính */}
            <h1 className="home-hero-title">
              {user ? (
                <>
                  {getGreeting()},{" "}
                  <span className="accent">{user.name}</span>
                  <br />
                  Tiếp tục hành trình học tập
                </>
              ) : (
                <>
                  Học Lập Trình
                  <br />
                  <span className="accent">Hiệu Quả Hơn</span>
                  <br />
                  Bao Giờ Hết?
                </>
              )}
            </h1>

            {/* Mô tả */}
            <p className="home-hero-desc">
              {user
                ? "Khám phá hàng trăm khóa học chất lượng cao từ các chuyên gia hàng đầu. Cập nhật kiến thức mới nhất từ Frontend, Backend đến DevOps."
                : "Học lập trình từ cơ bản đến nâng cao với các khóa học được thiết kế bài bản. Hơn 50,000+ học viên đã tin tưởng và đồng hành cùng Courses."}
            </p>

            {/* Nút hành động - PRO STYLE */}
            <div className="hero-cta-group">
              <Link to="/courses" className="hero-cta-primary">
                Khám phá khóa học
              </Link>
              {user ? (
                <Link to="/my-learning" className="hero-cta-secondary">
                  Khóa học của tôi
                </Link>
              ) : (
                <Link to="/register" className="hero-cta-secondary">
                  Đăng ký miễn phí
                </Link>
              )}
            </div>

            {/* Stats row */}
            <div className="hero-stats">
              {[
                { value: "200+", label: "Khóa học" },
                { value: "50,000+", label: "Học viên" },
                { value: "4.9/5", label: "Đánh giá" },
                { value: "100+", label: "Giảng viên" },
              ].map((stat) => (
                <div key={stat.label} className="hero-stat">
                  <div className="hero-stat-value">{stat.value}</div>
                  <div className="hero-stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hình ảnh bên phải */}
          <div className="hero-visual">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80"
              alt="Học lập trình cùng Courses"
            />
          </div>
        </div>
      </section>

      {/* ==================== CATEGORIES ==================== */}
      <section className="home-section">
        <div className="home-container">
          <div className="section-header">
            <div>
              <div className="section-tag">Danh mục</div>
              <h2 className="section-title">Khám phá theo chủ đề</h2>
              <p className="section-desc">
                Chọn lĩnh vực bạn quan tâm để tìm khóa học phù hợp nhất
              </p>
            </div>
          </div>

          {loading ? (
            <div className="home-loading">Đang tải danh mục...</div>
          ) : (
            <div className="home-categories-grid">
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/courses?category=${cat.slug}`}
                  className="home-category-card"
                >
                  <div
                    className="home-category-icon"
                    style={{
                      backgroundColor: cat.color ? `${cat.color}15` : "#eff6ff",
                      color: cat.color || "#3b82f6",
                    }}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    </svg>
                  </div>
                  <div className="home-category-name">{cat.name}</div>
                  <div className="home-category-count">
                    {cat.courseCount || 0} khóa học
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ==================== FEATURED COURSES ==================== */}
      <section className="home-section gray">
        <div className="home-container">
          <div className="section-header">
            <div>
              <div className="section-tag">Noi bat</div>
              <h2 className="section-title">Khóa học được yêu thích nhất</h2>
              <p className="section-desc">
                Những khóa học chất lượng cao, được đánh giá tốt nhất
              </p>
            </div>
            <Link to="/courses" className="section-link">
              Xem tất cả
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="home-loading">Đang tải khóa học...</div>
          ) : (
            <div className="home-courses-grid">
              {[...featuredCourses]
                .sort((a, b) => {
                  const aOwned = ownedCourseIds.has(a._id);
                  const bOwned = ownedCourseIds.has(b._id);
                  if (aOwned === bOwned) return 0;
                  return aOwned ? -1 : 1; // owned lên đầu
                })
                .map((course) => {
                const isOwned = ownedCourseIds.has(course._id) || user?.role === "admin";
                return (
                <div
                  key={course._id}
                  onClick={() => navigate(`/courses/${course.slug}`)}
                  className={`course-card ${isOwned ? "owned" : ""}`}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={course.image}
                    alt={course.title}
                    className="course-card-image"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80";
                    }}
                  />
                  <div className="course-card-body">
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      <span
                        className="course-card-category"
                        style={{
                          background: course.category?.color ? `${course.category.color}15` : "#eff6ff",
                          color: course.category?.color || "#3b82f6",
                        }}
                      >
                        {course.category?.name || "Lập trình"}
                      </span>
                      <span className="course-card-level">{course.level}</span>
                      {isOwned && (
                        <span
                          className="course-card-level"
                          style={{
                            background: "rgba(16, 185, 129, 0.12)",
                            color: "var(--success)",
                            border: "1px solid rgba(16, 185, 129, 0.35)",
                            fontWeight: 700,
                          }}
                        >
                          Đã sở hữu
                        </span>
                      )}
                    </div>
                    <h3 className="course-card-title">{course.title}</h3>
                    <p className="course-card-desc">{course.description}</p>
                    <div className="course-card-footer">
                      <div>
                        {isOwned ? (
                          <span className="course-card-price" style={{ color: "var(--success)" }}>
                            Đã sở hữu
                          </span>
                        ) : course.discountPrice ? (
                          <>
                            <span className="course-card-price-old">
                              {course.price.toLocaleString("vi-VN")}đ
                            </span>
                            <span className="course-card-price course-card-price-sale">
                              {course.discountPrice.toLocaleString("vi-VN")}đ
                            </span>
                          </>
                        ) : course.price === 0 ? (
                          <span className="course-card-price course-card-price-free">Miễn phí</span>
                        ) : (
                          <span className="course-card-price">
                            {course.price.toLocaleString("vi-VN")}đ
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                        {course.enrolledCount?.toLocaleString() || 0} học viên
                      </span>
                    </div>
                    <div className="course-card-actions" style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                      {isOwned ? (
                        <button
                          className="btn btn-primary owned-cta"
                          style={{ flex: 1, padding: "8px 0", fontSize: "0.85rem", borderRadius: "6px" }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(`/learning/${course.slug}`);
                          }}
                        >
                          Vào học ngay
                        </button>
                      ) : (
                        <>
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
                        </>
                      )}
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ==================== WHY CHOOSE US ==================== */}
      <section className="home-section">
        <div className="home-container">
          <div className="section-header" style={{ textAlign: "center", marginBottom: "48px" }}>
            <div className="section-tag">Tai sao chon chung toi</div>
            <h2 className="section-title">Điều gì khiến Courses khác biệt?</h2>
          </div>

          <div className="home-features-grid">
            {[
              {
                title: "Giảng viên chuyên nghiệp",
                desc: "Đội ngũ giảng viên giàu kinh nghiệm, là các developer và tech lead từ các công ty lớn.",
                color: "#eff6ff",
                svg: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                ),
              },
              {
                title: "Nội dung luôn mới",
                desc: "Khóa học được cập nhật liên tục theo xu hướng công nghệ mới nhất. Đảm bảo bạn luôn đi đầu.",
                color: "#ecfdf5",
                svg: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                ),
              },
              {
                title: "Học mọi lúc, mọi nơi",
                desc: "Học trên mọi thiết bị: máy tính, tablet, điện thoại. Video bài giảng chất lượng cao.",
                color: "#f5f3ff",
                svg: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                ),
              },
              {
                title: "Chứng chỉ hoàn thành",
                desc: "Nhận chứng chỉ hoàn thành khóa học có giá trị. Được các nhà tuyển dụng công nhận.",
                color: "#fffbeb",
                svg: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="7"/>
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                  </svg>
                ),
              },
            ].map((feature) => (
              <div key={feature.title} className="home-feature-card">
                <div className="home-feature-icon" style={{ background: feature.color }}>
                  {feature.svg}
                </div>
                <h3 className="home-feature-title">{feature.title}</h3>
                <p className="home-feature-desc">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CTA BANNER ==================== */}
      <section className="home-cta">
        <div className="home-cta-inner">
          <h2 className="home-cta-title">
            {user ? "Tiếp tục hành trình học tập!" : "Sẵn sàng bắt đầu chưa?"}
          </h2>
          <p className="home-cta-desc">
            {user
              ? "Đăng ký thêm khóa học mới hoặc tiếp tục học để nâng cao kỹ năng của bạn."
              : "Tham gia cùng 50,000+ học viên đang học và phát triển kỹ năng lập trình mỗi ngày."}
          </p>
          <div className="home-cta-actions">
            {user ? (
              <>
                <Link to="/courses" className="cta-btn-white">Khám phá khóa học</Link>
                <Link to="/my-learning" className="cta-btn-outline-white">Khóa học của tôi</Link>
              </>
            ) : (
              <>
                <Link to="/register" className="cta-btn-white">Đăng ký miễn phí</Link>
                <Link to="/courses" className="cta-btn-outline-white">Xem khóa học</Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="home-footer">
        <div className="home-footer-inner">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/logo-codenova.svg" alt="Courses" className="footer-logo-image" />
            </div>
            <p className="footer-brand-desc">
              Courses - nền tảng học lập trình hiện đại, thực chiến và truyền cảm hứng cho thế hệ developer mới.
            </p>
          </div>

          <div className="footer-links-group">
            <div className="footer-col-title">Khóa học</div>
            <Link to="/courses" className="footer-link">Tất cả khóa học</Link>
            <Link to="/courses?category=frontend" className="footer-link">Frontend</Link>
            <Link to="/courses?category=backend" className="footer-link">Backend</Link>
            <Link to="/courses?category=devops" className="footer-link">DevOps</Link>
          </div>

          <div className="footer-links-group">
            <div className="footer-col-title">Tài khoản</div>
            <Link to="/login" className="footer-link">Đăng nhập</Link>
            <Link to="/register" className="footer-link">Đăng ký</Link>
            <Link to="/profile" className="footer-link">Hồ sơ cá nhân</Link>
            <Link to="/wishlist" className="footer-link">Yêu thích</Link>
          </div>

          <div className="footer-links-group">
            <div className="footer-col-title">Liên kết</div>
            <Link to="/admin" className="footer-link">Trang quản trị</Link>
            <span className="footer-link">Chính sách bảo mật</span>
            <span className="footer-link">Điều khoản sử dụng</span>
            <span className="footer-link">Liên hệ hỗ trợ</span>
          </div>
        </div>

        <div className="home-footer-bottom">
          <span>© 2026 Courses. Tất cả quyền được bảo lưu.</span>
          <span>Made in Vietnam</span>
        </div>
      </footer>
    </div>
  );
}
