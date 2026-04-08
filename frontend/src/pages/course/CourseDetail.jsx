// ================================================
// PAGE: CourseDetail - Trang chi tiết khóa học
// Mô tả: Hiển thị thông tin đầy đủ, thêm vào giỏ hàng, đánh giá
// FEATURE 12, 16, 17: Chi tiết, đánh giá, wishlist
// ================================================
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Icon from "../../components/Icon";
import {
  getCourseBySlug,
  addReview,
  toggleWishlist,
  getMyEnrolledCourses,
} from "../../services/courseService";
import { getUser } from "../../services/authService";
import "../../styles/course.css";

export default function CourseDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  // State lưu thông tin khóa học
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedSection, setExpandedSection] = useState(0);
  const [isEnrolled, setIsEnrolled] = useState(false);

  // ================================================
  // EFFECT: Lấy thông tin khóa học + user khi mount
  // ================================================
  useEffect(() => {
    fetchCourse();
    const currentUser = getUser();
    setUser(currentUser);
    if (currentUser) {
      checkEnrollment();
    }
  }, [slug]);

  const checkEnrollment = async () => {
    try {
      const res = await getMyEnrolledCourses();
      if (res.data?.success && res.data.data) {
        // Có 3 trường hợp được coi là "đã sở hữu":
        // 1. User đã mua (có trong enrolledCourses)
        // 2. User là ADMIN (có quyền xem mọi thứ)
        // 3. User là GIẢNG VIÊN của chính khóa học này
        const enrolled = res.data.data.some((c) => c.slug === slug);
        const isAdmin = user?.role === "admin";
        const isInstructorOwner = user?.role === "instructor" && course?.instructor?._id === user?.id;

        setIsEnrolled(enrolled || isAdmin || isInstructorOwner);
      }
    } catch (err) {
      console.log("Check enrollment error:", err);
    }
  };

  // ================================================
  // FEATURE 12: Lấy chi tiết khóa học theo slug
  // ================================================
  const fetchCourse = async () => {
    setLoading(true);
    try {
      const res = await getCourseBySlug(slug);
      if (res.data.success) {
        setCourse(res.data.data);
      }
    } catch (error) {
      console.error("Lỗi lấy chi tiết khóa học:", error);
    } finally {
      setLoading(false);
    }
  };

  // ================================================
  // FEATURE: Thêm vào giỏ hàng
  // ================================================
  const handleAddToCart = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (!Array.isArray(cart)) cart = [];
    if (cart.some((item) => (item._id || item.courseId) === course._id)) {
      return;
    }

    const cartItem = {
      _id: course._id,
      courseId: course._id,
      title: course.title,
      image: course.image,
      price: course.price,
      discountPrice: course.discountPrice || null,
      authorName: course.authorName,
      slug: course.slug,
    };

    cart.push(cartItem);
    localStorage.setItem("cart", JSON.stringify(cart));

    window.dispatchEvent(new Event("cartUpdated"));
    window.dispatchEvent(new Event("storage")); // Ensure navbar catches it if it listens to storage
  };

  // ================================================
  // FEATURE: Mua ngay
  // ================================================
  const handleBuyNow = () => {
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
        authorName: course.authorName,
        slug: course.slug,
      };

      cart.push(cartItem);
      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("storage"));
    }

    navigate("/checkout");
  };

  // ================================================
  // FEATURE 17: Toggle wishlist
  // ================================================
  const handleToggleWishlist = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const action = isWishlisted ? "remove" : "add";
      const res = await toggleWishlist(course._id, action);
      if (res.data.success) {
        setIsWishlisted(res.data.isWishlisted);
        setMessage({
          type: "success",
          text: res.data.isWishlisted ? "Đã thêm vào yêu thích!" : "Đã bỏ khỏi yêu thích!",
        });
      }
    } catch (err) {
      console.error("Lỗi toggle wishlist:", err);
    }
  };

  // ================================================
  // FEATURE 16: Thêm đánh giá
  // ================================================
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    try {
      const res = await addReview(course._id, {
        rating: reviewRating,
        comment: reviewComment,
      });
      if (res.data.success) {
        setMessage({ type: "success", text: "Đánh giá thành công!" });
        setShowReviewForm(false);
        setReviewComment("");
        fetchCourse();
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Bạn đã đánh giá khóa học này rồi",
      });
    } finally {
      setReviewLoading(false);
    }
  };

  // ================================================
  // Tính giá hiển thị
  // ================================================
  
  // ================================================
  // DUMMY DATA FOR LMS UI
  // ================================================
  const defaultCurriculum = [
    { title: "Chương 1: Giới thiệu tổng quan", lessons: [
      { title: "1.1 Giới thiệu khóa học", duration: 5, isFreePreview: true },
      { title: "1.2 Cách học hiệu quả", duration: 10, isFreePreview: true },
      { title: "1.3 Cài đặt môi trường", duration: 15, isFreePreview: false }
    ]},
    { title: "Chương 2: Kiến thức nền tảng", lessons: [
      { title: "2.1 Các khái niệm cơ bản", duration: 20, isFreePreview: false },
      { title: "2.2 Thực hành phần 1", duration: 45, isFreePreview: false },
      { title: "2.3 Bài tập tự luyện", duration: 30, isFreePreview: false }
    ]},
    { title: "Chương 3: Xây dựng dự án thực tế", lessons: [
      { title: "3.1 Phân tích yêu cầu và thiết kế", duration: 25, isFreePreview: false },
      { title: "3.2 Code Backend API", duration: 60, isFreePreview: false },
      { title: "3.3 Code Frontend UI", duration: 55, isFreePreview: false },
      { title: "3.4 Tích hợp và Deploy", duration: 40, isFreePreview: false }
    ]}
  ];

  const courseCurriculum = course?.curriculum?.length > 0 ? course.curriculum : defaultCurriculum;

  const displayPrice = course?.discountPrice || course?.price;
  const hasDiscount =
    course?.discountPrice && course?.discountPrice < course?.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - course.discountPrice / course.price) * 100)
    : 0;

  // ================================================
  // RENDER: Loading
  // ================================================
  if (loading) {
    return (
      <div className="course-detail-container">
        <div className="loading-state">
          <div className="spinner spinner-large"></div>
          <p>Đang tải thông tin khóa học...</p>
        </div>
      </div>
    );
  }

  // ================================================
  // RENDER: Không tìm thấy
  // ================================================
  if (!course) {
    return (
      <div className="course-detail-container">
        <div className="course-detail-inner">
          <div className="empty-state">
            <h3 style={{ color: "var(--text-primary)", marginBottom: "8px" }}>
              Khóa học không tồn tại
            </h3>
            <Link to="/courses" className="btn btn-primary" style={{ marginTop: "16px" }}>
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ================================================
  // RENDER: Giao diện chi tiết khóa học
  // ================================================
  return (
    <div className="course-detail-container">
      <div className="course-detail-inner">
        {/* ===== NÚT QUAY LẠI ===== */}
        <Link to="/courses" className="detail-back">
          ← Danh sách khóa học
        </Link>

        {/* ===== THÔNG BÁO ===== */}
        {message.text && (
          <div className={`message-box ${message.type}`}>{message.text}</div>
        )}

        {/* ===== HERO ẢNH BÌA ===== */}
        <div className="detail-hero">
          <img
            src={course.image}
            alt={course.title}
            className="detail-hero-img"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80";
            }}
          />
          <div className="detail-hero-overlay"></div>
        </div>

        {/* ===== LAYOUT 2 CỘT ===== */}
        <div className="detail-layout">
          {/* ===== MAIN CONTENT ===== */}
          <div className="detail-main">
            {/* Badges */}
            <div className="detail-badges">
              <span
                className="detail-badge"
                style={{
                  background: course.category?.color ? `${course.category.color}15` : "#eff6ff",
                  color: course.category?.color || "#3b82f6",
                }}
              >
                {course.category?.name || "Lập trình"}
              </span>
              <span className="detail-badge" style={{ background: "#f5f3ff", color: "#8b5cf6" }}>
                {course.level}
              </span>
            </div>

            {/* Tiêu đề */}
            <h1>{course.title}</h1>
            <div className="detail-desc">{course.description}</div>

            {/* ===== NEW TABS NAVIGATION ===== */}
            <div className="course-tabs-nav" style={{ display: 'flex', gap: '24px', borderBottom: '2px solid #e2e8f0', marginBottom: '24px', marginTop: '32px' }}>
              <button 
                className="tab-nav-btn" 
                onClick={() => { document.getElementById('overview')?.scrollIntoView({ behavior: 'smooth' }); }}
              >
                Giới thiệu
              </button>
              <button 
                className="tab-nav-btn" 
                onClick={() => { document.getElementById('curriculum')?.scrollIntoView({ behavior: 'smooth' }); }}
              >
                Nội dung bài học
              </button>
              <button 
                className="tab-nav-btn" 
                onClick={() => { document.getElementById('resources')?.scrollIntoView({ behavior: 'smooth' }); }}
              >
                Tài liệu
              </button>
              <button 
                className="tab-nav-btn" 
                onClick={() => { document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' }); }}
              >
                Đánh giá
              </button>
            </div>

            {/* ===== TAB CONTENT ===== */}
            <div className="tab-content-area">
              
              {/* SECTION 1: GIỚI THIỆU */}
              <div id="overview" className="tab-pane" style={{ marginBottom: '40px' }}>
                {/* Học được gì */}
                  {course.whatYouLearn && (
                    <div className="detail-section">
                      <div className="detail-section-title">Bạn sẽ học được</div>
                      <div className="what-you-learn-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {course.whatYouLearn.split('\n').map((line, idx) => (
                          line.trim() && (
                            <div key={idx} style={{display:'flex', gap:'8px', alignItems:'flex-start'}}>
                              <span style={{color:'#10b981', marginTop: '2px'}}>
                                <Icon name="star" size={14} />
                              </span>
                              <span>{line}</span>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Yêu cầu */}
                  {course.prerequisites && (
                    <div className="detail-section">
                      <div className="detail-section-title">Yêu cầu</div>
                      <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)' }}>
                        {course.prerequisites.split('\n').map((line, idx) => (
                          line.trim() && <li key={idx} style={{marginBottom:'8px'}}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>

              {/* SECTION 2: CURRICULUM */}
              <div id="curriculum" className="tab-pane" style={{ marginBottom: '40px' }}>
                <div className="detail-section-title" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span>Nội dung khóa học</span>
                    <span style={{fontSize:'0.9rem', color:'var(--text-muted)', fontWeight:'normal'}}>
                      {courseCurriculum.length} chương • {courseCurriculum.reduce((a,c) => a + c.lessons.length, 0)} bài học
                    </span>
                  </div>
                  
                  <div className="curriculum-accordion">
                    {courseCurriculum.map((section, sIdx) => (
                      <div key={sIdx} className={`accordion-item ${expandedSection === sIdx ? 'expanded' : ''}`}>
                        <div 
                          className="accordion-header" 
                          onClick={() => setExpandedSection(expandedSection === sIdx ? -1 : sIdx)}
                        >
                          <div style={{fontWeight:'700'}}>{section.title}</div>
                          <div style={{fontSize:'0.85rem', color:'var(--text-muted)'}}>
                            {section.lessons.length} bài học • {section.lessons.reduce((a,c) => a + (c.duration||0), 0)} phút
                          </div>
                        </div>
                        {expandedSection === sIdx && (
                          <div className="accordion-body">
                            {section.lessons.map((lesson, lIdx) => (
                              <div key={lIdx} className="lesson-item" onClick={() => navigate(`/learning/${course?.slug}`)}>
                                <div className="lesson-title">
                                  <span className="lesson-icon" style={{ display: "inline-flex", alignItems: "center" }}>
                                    <Icon name={lesson.videoUrl ? "chevronRight" : "settings"} size={16} />
                                  </span>
                                  {lesson.title}
                                </div>
                                <div className="lesson-meta">
                                  {lesson.isFreePreview && !isEnrolled ? (
                                    <span className="preview-badge">Xem trước</span>
                                  ) : !isEnrolled ? (
                                    <span className="locked-icon" title="Cần mua khóa học để xem" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                      <Icon name="lock" size={14} />
                                      Đã khóa
                                    </span>
                                  ) : null}
                                  <span className="lesson-duration">{lesson.duration || 0} phút</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              {/* SECTION 3: RESOURCES */}
              <div id="resources" className="tab-pane" style={{ marginBottom: '40px' }}>
                <div className="detail-section-title">Tài liệu đính kèm</div>
                  {!isEnrolled ? (
                    <div className="locked-resources glass-panel" style={{ textAlign:'center', padding:'40px 20px' }}>
                      <div style={{ fontSize:'1.6rem', marginBottom:'12px', fontWeight: 800, color: 'var(--text-primary)' }}>
                        Nội dung bị khóa
                      </div>
                      <h3 style={{ marginBottom:'8px' }}>Tài liệu bị khóa</h3>
                      <p style={{ color:'var(--text-muted)' }}>Vui lòng mua khóa học để truy cập source code, PDF slide bài giảng và các tài liệu độc quyền khác.</p>
                      <button className="btn btn-primary" style={{ marginTop:'16px' }} onClick={handleBuyNow}>
                        Mua khóa học ngay
                      </button>
                    </div>
                  ) : (
                    <div className="unlocked-resources">
                      <div className="resource-item">
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
                          <Icon name="search" size={20} />
                        </span>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:'600'}}>Slide bài giảng toàn khóa (PDF)</div>
                          <div style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>15.2 MB</div>
                        </div>
                        <button className="btn btn-outline btn-sm">Tải xuống</button>
                      </div>
                      <div className="resource-item">
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
                          <Icon name="settings" size={20} />
                        </span>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:'600'}}>Source code thực hành (ZIP)</div>
                          <div style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>45.8 MB</div>
                        </div>
                        <button className="btn btn-outline btn-sm">Tải xuống</button>
                      </div>
                    </div>
                  )}
              </div>

              {/* SECTION 4: REVIEWS */}
              <div id="reviews" className="detail-section" style={{ marginBottom: '40px' }}>
              <div className="detail-section-title">
                Đánh giá ({course.totalReviews || 0}) &nbsp;
                <span style={{ fontWeight: "800", color: "#f59e0b" }}>
                  {course.averageRating?.toFixed(1) || "0.0"}
                </span>
              </div>

              {!showReviewForm && user && (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setShowReviewForm(true)}
                  style={{ marginTop: "8px" }}
                >
                  Viết đánh giá
                </button>
              )}

              {showReviewForm && (
                <form
                  className="glass-panel"
                  onSubmit={handleSubmitReview}
                  style={{ padding: "20px", marginTop: "12px" }}
                >
                  <div style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "12px" }}>
                    Viết đánh giá của bạn
                  </div>

                  {/* Chọn sao */}
                  <div style={{ display: "flex", gap: "4px", marginBottom: "12px" }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        style={{
                          background: "none",
                          border: "none",
                          fontSize: "1.5rem",
                          cursor: "pointer",
                          color: star <= reviewRating ? "#f59e0b" : "#e2e8f0",
                          padding: "0",
                        }}
                      >
                        <span style={{ display: "inline-flex", alignItems: "center" }}>
                          <Icon name="star" size={18} />
                        </span>
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Chia sẻ cảm nhận của bạn về khóa học..."
                    rows={4}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                      fontSize: "0.875rem",
                      fontFamily: "var(--font)",
                      resize: "vertical",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />

                  <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setShowReviewForm(false)}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      disabled={reviewLoading}
                    >
                      {reviewLoading ? "Đang gửi..." : "Gửi đánh giá"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

          {/* ===== SIDEBAR: GIÁ + HÀNH ĐỘNG ===== */}
          <div className="detail-sidebar">
            <img
              src={course.image}
              alt={course.title}
              className="detail-sidebar-img"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80";
              }}
            />
            <div className="detail-sidebar-body">
              {/* Giá */}
              <div>
                {isEnrolled ? (
                  <span className="price-free" style={{ fontSize: "1.35rem", fontWeight: "900", color: "var(--success)" }}>
                    Đã sở hữu
                  </span>
                ) : course.price === 0 ? (
                  <span className="price-free" style={{ fontSize: "1.8rem", fontWeight: "800" }}>
                    Miễn phí
                  </span>
                ) : hasDiscount ? (
                  <>
                    <span className="sidebar-price">
                      {displayPrice.toLocaleString("vi-VN")}đ
                    </span>
                    <span className="sidebar-price-old">
                      {course.price.toLocaleString("vi-VN")}đ
                    </span>
                    <span
                      style={{
                        display: "inline-block",
                        background: "#ef4444",
                        color: "white",
                        padding: "2px 10px",
                        borderRadius: "20px",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        marginLeft: "8px",
                      }}
                    >
                      -{discountPercent}%
                    </span>
                  </>
                ) : (
                  <span className="sidebar-price">
                    {displayPrice.toLocaleString("vi-VN")}đ
                  </span>
                )}
              </div>

              <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                {isEnrolled ? (
                  <button 
                    className="btn btn-primary" 
                    style={{ flex: 1, padding: "12px 0", fontSize: "1rem", borderRadius: "8px", background: "#10b981", borderColor: "#10b981" }}
                    onClick={() => {
                      document.getElementById("curriculum")?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Vào học ngay
                  </button>
                ) : (
                  <>
                    <button 
                      className="btn btn-primary" 
                      style={{ flex: 1, padding: "12px 0", fontSize: "1rem", borderRadius: "8px" }}
                      onClick={handleBuyNow}
                    >
                      {course.price === 0 ? "Đăng ký free" : "Mua ngay"}
                    </button>
                    <button 
                      className="btn btn-outline" 
                      style={{ flex: 1, padding: "12px 0", fontSize: "1rem", borderRadius: "8px" }}
                      onClick={handleAddToCart}
                    >
                      Thêm giỏ hàng
                    </button>
                  </>
                )}
              </div>

              {/* Nút wishlist */}
              <button
                className="btn btn-outline"
                onClick={handleToggleWishlist}
                style={{ width: "100%", marginTop: "8px", justifyContent: "center" }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                  <Icon name="heart" size={18} />
                  {isWishlisted ? "Đã yêu thích" : "Thêm vào yêu thích"}
                </span>
              </button>

              {/* Thông tin khóa học */}
              <div className="sidebar-meta">
                {[
                  { icon: "clock", label: "Cấp độ", value: course.level },
                  { icon: "user", label: "Giảng viên", value: course.authorName },
                  { icon: "star", label: "Bài học", value: `${course.totalLessons || 0} bài` },
                  { icon: "clock", label: "Thời lượng", value: course.totalDuration ? `${Math.floor(course.totalDuration / 60)}h ${course.totalDuration % 60}p` : "—" },
                  { icon: "users", label: "Học viên", value: course.enrolledCount?.toLocaleString() || 0 },
                  { icon: "clock", label: "Cập nhật", value: new Date(course.updatedAt).toLocaleDateString("vi-VN") },
                  { icon: "settings", label: "Ngôn ngữ", value: course.language || "Tiếng Việt" },
                ].map((row) => (
                  <div key={row.label} className="sidebar-meta-row">
                    <span className="label" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                      <Icon name={row.icon} size={16} />
                      {row.label}
                    </span>
                    <span className="value">{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Bảo đảm */}
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", textAlign: "center", marginTop: "8px" }}>
                Thanh toán an toàn · Đảm bảo hoàn tiền trong 30 ngày
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
