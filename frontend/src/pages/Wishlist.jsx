// ================================================
// PAGE: Wishlist - Trang danh sách yêu thích
// Mô tả: Hiển thị và quản lý khóa học yêu thích
// FEATURE 17: Toggle wishlist
// ================================================
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProfile, getUser } from "../services/authService";
import { toggleWishlist } from "../services/courseService";
import Icon from "../components/Icon";
import "../styles/course.css";

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user] = useState(getUser());
  const navigate = useNavigate();

  const handleAddToCart = (e, course) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role === "admin") return;

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
    window.dispatchEvent(new Event("storage"));
  };

  const handleBuyNow = (e, course) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role === "admin") {
      navigate(`/learning/${course.slug}`);
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

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await getProfile();
      if (res.data.success) {
        setWishlist(res.data.data.wishlist || []);
      }
    } catch (err) {
      console.error("Lỗi lấy wishlist:", err);
    } finally {
      setLoading(false);
    }
  };

  // ================================================
  // Xóa khóa học khỏi wishlist
  // ================================================
  const handleRemove = async (courseId) => {
    try {
      const res = await toggleWishlist(courseId, "remove");
      if (res.data.success) {
        setWishlist((prev) => prev.filter((c) => c._id !== courseId));
      }
    } catch (err) {
      console.error("Lỗi xóa wishlist:", err);
    }
  };

  if (loading) {
    return (
      <div className="course-detail-container">
        <div className="loading-state">
          <div className="spinner spinner-large"></div>
          <p>Đang tải...</p>
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
              <Icon name="heart" size={20} /> Danh sách yêu thích
            </span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            {wishlist.length} khóa học trong wishlist
          </p>
        </div>

        {wishlist.length === 0 ? (
          <div className="empty-state">
            <h3 style={{ color: "var(--text-primary)", marginBottom: "8px" }}>
              Chưa có khóa học yêu thích
            </h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>
              Bạn có thể thêm khóa học vào danh sách yêu thích từ trang chi tiết khóa học.
            </p>
            <Link to="/courses" className="btn btn-primary">
              Khám phá khóa học
            </Link>
          </div>
        ) : (
          <div className="courses-grid">
            {wishlist.map((course) => (
              <div className="course-card" key={course._id}>
                <Link to={`/courses/${course.slug}`}>
                  <img
                    src={course.image}
                    alt={course.title}
                    className="course-image"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80";
                    }}
                  />
                </Link>
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
                  <div className="course-footer">
                    <span className="course-price">
                      {course.price === 0 ? (
                        <span className="price-free">Miễn phí</span>
                      ) : course.discountPrice ? (
                        <>
                          <span className="price-old">
                            {course.price.toLocaleString("vi-VN")}đ
                          </span>
                          <span className="price-sale">
                            {course.discountPrice.toLocaleString("vi-VN")}đ
                          </span>
                        </>
                      ) : (
                        <span className="price-normal">
                          {course.price.toLocaleString("vi-VN")}đ
                        </span>
                      )}
                    </span>
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ padding: "4px 10px", fontSize: "0.75rem" }}
                      onClick={() => handleRemove(course._id)}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                        <Icon name="trash" size={16} />
                        Bỏ thích
                      </span>
                    </button>
                  </div>
                  {/* Hành động: Mua & Thêm giỏ hàng */}
                  <div className="course-card-actions" style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                    {user?.role === "admin" ? (
                      <button 
                        className="btn btn-primary" 
                        style={{ flex: 1, padding: "8px 0", fontSize: "0.85rem", borderRadius: "6px", background: "#10b981", borderColor: "#10b981" }}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
