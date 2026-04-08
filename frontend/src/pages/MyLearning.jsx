// ================================================
// PAGE: MyLearning - Trang khóa học đã đăng ký
// Mô tả: Hiển thị danh sách khóa học user đã mua
// FEATURE 20: Lấy khóa học đã đăng ký
// ================================================
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyEnrolledCourses } from "../services/courseService";
import Icon from "../components/Icon";
import "../styles/course.css";

export default function MyLearning() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================================================
  // Lấy danh sách khóa học đã đăng ký
  // ================================================
  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      const res = await getMyEnrolledCourses();
      if (res.data.success) {
        setCourses(res.data.data);
      }
    } catch (err) {
      console.error("Lỗi lấy khóa học:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="course-detail-container">
        <div className="loading-state">
          <div className="spinner spinner-large"></div>
          <p>Đang tải khóa học...</p>
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
              <Icon name="star" size={20} /> Khóa học của tôi
            </span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Bạn đã đăng ký {courses.length} khóa học
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="empty-state">
            <h3 style={{ color: "var(--text-primary)", marginBottom: "8px" }}>
              Chưa có khóa học nào
            </h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>
              Bạn chưa đăng ký khóa học nào. Hãy khám phá ngay!
            </p>
            <Link to="/courses" className="btn btn-primary">
              Khám phá khóa học
            </Link>
          </div>
        ) : (
          <div className="courses-grid">
            {courses.map((course) => (
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
                    <span style={{ fontSize: "0.85rem", color: "var(--success)", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                      <Icon name="checkCircle" size={16} />
                      Đã đăng ký
                    </span>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <Icon name="users" size={14} /> {course.enrolledCount?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
