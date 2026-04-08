import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TeacherLayout from "../../components/TeacherLayout";
import Icon from "../../components/Icon";
import { getMyCourses } from "../../services/courseService";

export default function TeacherDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await getMyCourses();
        if (res.data.success) {
          setCourses(res.data.data);
        }
      } catch (error) {
        console.error("Failed to load teacher dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const stats = {
    totalCourses: courses.length,
    publishedCourses: courses.filter((course) => course.status === "Công khai").length,
    draftCourses: courses.filter((course) => course.status === "Nháp").length,
    totalStudents: courses.reduce((sum, course) => sum + (course.enrolledCount || 0), 0),
  };

  const recentCourses = [...courses].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  ).slice(0, 3);

  return (
    <TeacherLayout
      title="Dashboard giảng viên"
      subtitle="Theo dõi khóa học và tình hình giảng dạy của bạn"
    >
      <section className="teacher-stats-grid">
        <article className="teacher-stat-card">
          <div className="teacher-stat-icon blue"><Icon name="bookOpen" size={18} /></div>
          <div>
            <p>Tổng khóa học</p>
            <strong>{loading ? "..." : stats.totalCourses}</strong>
          </div>
        </article>

        <article className="teacher-stat-card">
          <div className="teacher-stat-icon green"><Icon name="checkCircle" size={18} /></div>
          <div>
            <p>Đang công khai</p>
            <strong>{loading ? "..." : stats.publishedCourses}</strong>
          </div>
        </article>

        <article className="teacher-stat-card">
          <div className="teacher-stat-icon amber"><Icon name="clock" size={18} /></div>
          <div>
            <p>Đang bản nháp</p>
            <strong>{loading ? "..." : stats.draftCourses}</strong>
          </div>
        </article>

        <article className="teacher-stat-card">
          <div className="teacher-stat-icon purple"><Icon name="users" size={18} /></div>
          <div>
            <p>Tổng học viên</p>
            <strong>{loading ? "..." : stats.totalStudents.toLocaleString("vi-VN")}</strong>
          </div>
        </article>
      </section>

      <section className="teacher-panel-grid">
        <article className="teacher-panel-card">
          <div className="teacher-panel-header">
            <div>
              <h2>Khóa học gần đây</h2>
              <p>Danh sách khóa học mới nhất của giảng viên</p>
            </div>
            <Link to="/teacher/courses" className="teacher-link-btn">
              Xem tất cả
            </Link>
          </div>

          {loading ? (
            <div className="teacher-empty-state">Đang tải dữ liệu...</div>
          ) : recentCourses.length === 0 ? (
            <div className="teacher-empty-state">Chưa có khóa học nào cho giao diện giảng viên.</div>
          ) : (
            <div className="teacher-list">
              {recentCourses.map((course) => (
                <div key={course._id} className="teacher-list-item">
                  <div>
                    <strong>{course.title}</strong>
                    <p>
                      {course.category?.name || "Chưa phân loại"} • {course.level} • {course.status}
                    </p>
                  </div>
                  <span>{(course.enrolledCount || 0).toLocaleString("vi-VN")} học viên</span>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="teacher-panel-card teacher-panel-note">
          <div className="teacher-panel-header">
            <div>
              <h2>Hướng mở rộng</h2>
              <p>Bộ khung đã sẵn sàng cho các màn hình nghiệp vụ tiếp theo</p>
            </div>
          </div>

          <ul className="teacher-check-list">
            <li>Quản lý nội dung bài học và curriculum</li>
            <li>Thêm trang theo dõi học viên từng khóa học</li>
            <li>Tích hợp thống kê doanh thu cho instructor</li>
          </ul>
        </article>
      </section>
    </TeacherLayout>
  );
}

