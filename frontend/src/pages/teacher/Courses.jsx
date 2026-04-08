import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import TeacherLayout from "../../components/TeacherLayout";
import Icon from "../../components/Icon";
import { getMyCourses } from "../../services/courseService";

export default function TeacherCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await getMyCourses();
        if (res.data.success) {
          setCourses(res.data.data);
        }
      } catch (error) {
        console.error("Failed to load teacher courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchSearch = !search || course.title?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = status === "all" || course.status === status;
      return matchSearch && matchStatus;
    });
  }, [courses, search, status]);

  return (
    <TeacherLayout
      title="Khóa học giảng dạy"
      subtitle="Danh sách khóa học đang thuộc giảng viên hiện tại"
    >
      <section className="teacher-panel-card">
        <div className="teacher-toolbar">
          <input
            className="teacher-input"
            type="text"
            placeholder="Tìm khóa học..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            className="teacher-select"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {loading ? (
          <div className="teacher-empty-state">Đang tải danh sách khóa học...</div>
        ) : filteredCourses.length === 0 ? (
          <div className="teacher-empty-state">Không có khóa học nào phù hợp với bộ lọc hiện tại.</div>
        ) : (
          <div className="teacher-table-wrapper">
            <table className="teacher-table">
              <thead>
                <tr>
                  <th>Khóa học</th>
                  <th>Danh mục</th>
                  <th>Học viên</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <tr key={course._id}>
                    <td>
                      <div className="teacher-course-cell">
                        <strong>{course.title}</strong>
                        <p>{course.level}</p>
                      </div>
                    </td>
                    <td>{course.category?.name || "Chưa phân loại"}</td>
                    <td>
                      <span className="teacher-inline-meta">
                        <Icon name="users" size={14} />
                        {(course.enrolledCount || 0).toLocaleString("vi-VN")}
                      </span>
                    </td>
                    <td>
                      <span className={`teacher-status teacher-status-${course.status}`}>
                        {course.status}
                      </span>
                    </td>
                    <td>
                      <Link to={`/courses/${course.slug}`} className="teacher-detail-btn">
                        Xem chi tiết
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </TeacherLayout>
  );
}
