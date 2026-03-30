import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import courseService from "../../services/courseService";
import "../../styles/course.css";

export default function CourseDetail() {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await courseService.getCourseBySlug(slug);
        if (res.success) setCourse(res.data);
      } catch (error) {
        console.error("Failed to fetch course details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [slug]);

  if (loading) return <div className="course-detail-container" style={{ textAlign: "center", padding: "100px" }}>Đang tải dữ liệu...</div>;
  if (!course) return <div className="course-detail-container" style={{ textAlign: "center", padding: "100px" }}>Khoá học không tồn tại. <Link to="/courses" style={{ color: "#10b981", marginLeft: "10px" }}>Quay lại</Link></div>;

  return (
    <div className="course-detail-container">
      <Link to="/courses" className="back-link">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        Danh sách khóa học
      </Link>
      
      <div className="course-detail-content">
        <div className="course-detail-hero">
          <img src={course.image} alt={course.title} className="course-hero-image" />
          <div className="course-hero-overlay"></div>
        </div>
        
        <div className="course-detail-body">
          <div className="course-detail-main">
            <span className="detail-badge">{course.category?.name || "Lập trình"}</span>
            <span className="detail-badge" style={{ background: "rgba(99, 102, 241, 0.2)", color: "#818cf8" }}>{course.level}</span>
            <h1>{course.title}</h1>
            <div className="course-description">
              {course.description}
            </div>
          </div>
          
          <div className="course-sidebar">
             <div className="sidebar-price">
               {course.price === 0 ? "Miễn phí" : `${course.price.toLocaleString("vi-VN")} đ`}
             </div>
             
             <div className="sidebar-info-row">
                <span>Cấp độ</span>
                <span>{course.level}</span>
             </div>
             <div className="sidebar-info-row">
                <span>Giảng viên</span>
                <span>{course.author}</span>
             </div>
             <div className="sidebar-info-row">
                <span>Cập nhật gần đây</span>
                <span>{new Date(course.updatedAt).toLocaleDateString("vi-VN")}</span>
             </div>
             
             <button className="enroll-btn">Đăng ký học ngay</button>
             <p style={{ fontSize: "0.85rem", color: "#64748b", textAlign: "center", marginTop: "16px" }}>
               Đảm bảo hoàn tiền trong 30 ngày.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
