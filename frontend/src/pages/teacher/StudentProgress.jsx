import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import TeacherLayout from "../../components/TeacherLayout";
import Icon from "../../components/Icon";
import { getInstructorCourseReport } from "../../services/progressService";

export default function StudentProgress() {
  const { courseId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await getInstructorCourseReport(courseId);
        if (res.data.success) {
          setReport(res.data.data);
        } else {
          setError(res.data.message || "Không thể tải báo cáo");
        }
      } catch (err) {
        console.error("Lỗi lấy báo cáo tiến độ:", err);
        setError("Lỗi kết nối máy chủ");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [courseId]);

  if (loading) {
    return (
      <TeacherLayout title="Đang tải..." subtitle="Vui lòng đợi trong giây lát">
        <div className="teacher-empty-state">Đang tính toán tiến độ học viên...</div>
      </TeacherLayout>
    );
  }

  if (error || !report) {
    return (
      <TeacherLayout title="Lỗi" subtitle="Đã có lỗi xảy ra">
        <div className="teacher-empty-state">
          <p>{error || "Không tìm thấy dữ liệu báo cáo"}</p>
          <Link to="/teacher/courses" className="teacher-detail-btn" style={{ marginTop: "20px" }}>
            Quay lại danh sách
          </Link>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout
      title="Tiến độ học viên"
      subtitle={`Khóa học: ${report.courseTitle}`}
    >
      <div className="teacher-toolbar" style={{ marginBottom: "24px" }}>
        <Link to="/teacher/courses" className="teacher-detail-btn" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
           ← Quay lại danh sách khóa học
        </Link>
      </div>

      <section className="teacher-panel-card">
        <div style={{ padding: "20px", borderBottom: "1px solid #e2e8f0" }}>
          <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Báo cáo chi tiết ({report.students.length} học viên đã bắt đầu học)</h3>
        </div>

        {report.students.length === 0 ? (
          <div className="teacher-empty-state">
             Chưa có học viên nào bắt đầu học bài giảng nào trong khóa học này.
          </div>
        ) : (
          <div className="teacher-table-wrapper">
            <table className="teacher-table">
              <thead>
                <tr>
                  <th>Học viên</th>
                  <th>Tiến độ</th>
                  <th>Bài học đã xong</th>
                  <th>Hoạt động cuối</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {report.students.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="teacher-course-cell">
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <img 
                            src={item.user.image || "https://ui-avatars.com/api/?name=" + item.user.name} 
                            alt={item.user.name} 
                            style={{ width: "32px", height: "32px", borderRadius: "50%" }}
                          />
                          <div>
                            <strong>{item.user.name}</strong>
                            <p style={{ fontSize: "0.75rem", color: "#64748b" }}>{item.user.email}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ minWidth: "120px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "4px" }}>
                          <span>{item.percent}%</span>
                        </div>
                        <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
                          <div 
                            style={{ 
                              width: `${item.percent}%`, 
                              height: "100%", 
                              background: item.percent === 100 ? "#10b981" : "#3b82f6",
                              transition: "width 0.3s ease" 
                            }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                       <span style={{ fontWeight: "600", color: "#0f172a" }}>{item.completedCount}</span> / {item.totalLessons}
                    </td>
                    <td>
                      <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                        {new Date(item.updatedAt).toLocaleDateString("vi-VN")}
                      </span>
                    </td>
                    <td>
                      <button className="teacher-detail-btn" style={{ fontSize: "0.75rem", padding: "6px 10px" }} onClick={() => alert("Tính năng xem chi tiết bài học đang phát triển")}>
                        Xem chi tiết
                      </button>
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
