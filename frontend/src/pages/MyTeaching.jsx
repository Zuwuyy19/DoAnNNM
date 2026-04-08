// ================================================
// PAGE: MyTeaching - Trang danh sách khóa học giảng dạy
// Mô tả: Hiển thị danh sách khóa học mà giảng viên đang phụ trách
// FEATURE 19: Lấy danh sách khóa học của Instructor
// ================================================
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyCourses } from "../services/courseService";
import Icon from "../components/Icon";
import "../styles/course.css";

export default function MyTeaching() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================================================
  // Lấy danh sách khóa học đang giảng dạy
  // ================================================
  useEffect(() => {
    fetchTeachingCourses();
  }, []);

  const fetchTeachingCourses = async () => {
    try {
      const res = await getMyCourses();
      if (res.data.success) {
        setCourses(res.data.data);
      }
    } catch (err) {
      console.error("Lỗi lấy khóa học giảng dạy:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="course-detail-container">
        <div className="loading-state">
          <div className="spinner spinner-large"></div>
          <p>Đang tải danh sách khóa học...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="course-detail-container">
      <div className="course-detail-inner">
        {/* ===== HEADER ===== */}
        <div style={{
          background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
          padding: "40px 0 32px",
          textAlign: "center",
          borderBottom: "1px solid var(--border)",
          marginBottom: "32px",
        }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "800", color: "var(--text-primary)", marginBottom: "8px" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
              <Icon name="star" size={20} /> Khóa học đang giảng dạy
            </span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Bạn đang phụ trách {courses.length} khóa học
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="empty-state">
            <h3 style={{ color: "var(--text-primary)", marginBottom: "8px" }}>
              Chưa có khóa học nào
            </h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>
              Bạn chưa phụ trách khóa học nào trong danh sách giảng dạy.
            </p>
            <Link to="/" className="btn btn-primary">
              Về trang chủ
            </Link>
          </div>
        ) : (
          <div className="courses-grid">
            {courses.map((course) => (
              <div
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
                    <span 
                      className="course-badge"
                      style={{
                        background: course.status === "published" ? "#ecfdf5" : "#fef2f2",
                        color: course.status === "published" ? "#10b981" : "#ef4444",
                      }}
                    >
                      {course.status === "published" ? "Đang công khai" : "Bản nháp"}
                    </span>
                  </div>
                  <h3 className="course-card-title">{course.title}</h3>
                  <p className="course-card-desc" style={{ WebkitLineClamp: 2 }}>{course.description}</p>
                  <div className="course-footer" style={{ marginTop: "auto" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                      <Icon name="users" size={16} />
                      {course.enrolledCount?.toLocaleString() || 0} học viên học tập
                    </span>
                  </div>
                  <div style={{ marginTop: "12px", borderTop: "1px solid #f1f5f9", paddingTop: "12px" }}>
                      <Link to={`/courses/${course.slug}`} className="btn btn-outline btn-sm" style={{ width: "100%", justifyContent: "center" }}>
                        Xem trang khóa học
                      </Link>
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
