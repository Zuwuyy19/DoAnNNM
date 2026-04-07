import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getCourseBySlug, getMyEnrolledCourses } from "../../services/courseService";
import { getUser } from "../../services/authService";
import Icon from "../../components/Icon";

export default function Learning() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [activeLesson, setActiveLesson] = useState(null);
  const [expandedSection, setExpandedSection] = useState(0);
  const [progress, setProgress] = useState(new Set());

  // ================================================
  // MOCK RICHER CURRICULUM
  // ================================================
  const defaultCurriculum = [
    { title: "Chương 1: Khởi động", lessons: [
      { id: "l1", title: "1.1 Tại sao bạn nên học khóa này?", type: "video", duration: 5, videoUrl: "https://www.youtube.com/embed/jfKfPfyJRdk" },
      { id: "l2", title: "1.2 Phương pháp học tập x10", type: "video", duration: 10, videoUrl: "https://www.youtube.com/embed/WJzSMRb4b08" },
      { id: "l3", title: "1.3 Slide & Tài liệu đính kèm (PDF)", type: "document", duration: 15, docUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
    ]},
    { title: "Chương 2: Kiến thức nền tảng", lessons: [
      { id: "l4", title: "2.1 Các khái niệm cơ bản (Lý thuyết)", type: "document", duration: 20, content: "Trong bài viết này, chúng ta sẽ tìm hiểu về các khái niệm rất cơ bản.\n\n 1. Biến (Variables)\n 2. Vòng lặp (Loops)\n 3. Cấu trúc điều kiện (Conditionals)\n \n Hãy đọc kỹ trước khi thực hành nhé!" },
      { id: "l5", title: "2.2 Hướng dẫn cài đặt công cụ", type: "video", duration: 45, videoUrl: "https://www.youtube.com/embed/zH3h1E2zEvk" },
      { id: "l6", title: "2.3 Demo tính năng thực hành", type: "video", duration: 30, videoUrl: "https://www.youtube.com/embed/zpOULjyy-n8" }
    ]},
    { title: "Chương 3: Thực chiến Xây dựng App", lessons: [
      { id: "l7", title: "3.1 Dựng khung Project UI", type: "video", duration: 25, videoUrl: "https://www.youtube.com/embed/I0TDeJ-I1l4" },
      { id: "l8", title: "3.2 Bố cục CSS căn bản", type: "video", duration: 60, videoUrl: "https://www.youtube.com/embed/OqWqWXYYEXg" },
      { id: "l9", title: "3.3 Code Backend & API", type: "video", duration: 55, videoUrl: "https://www.youtube.com/embed/W6NZfCO5SIk" },
      { id: "l10", title: "3.4 Tích hợp và Deploy Cloud", type: "document", duration: 40, content: "Bài này cung cấp lệnh deploy lên máy chủ.\n$ npm run build\n$ pm2 start server.js\n\nChúc mừng bạn đã hoàn thành!" }
    ]}
  ];

  useEffect(() => {
    fetchCourseAndEnrollment();
    // Load tiến độ học từ trình duyệt (localStorage)
    const savedProgress = localStorage.getItem(`progress_${slug}`);
    if (savedProgress) {
      setProgress(new Set(JSON.parse(savedProgress)));
    }
  }, [slug]);

  const fetchCourseAndEnrollment = async () => {
    setLoading(true);
    try {
      const user = getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      // 1. Lấy thông tin khóa học
      const courseRes = await getCourseBySlug(slug);
      let loadedCourse = null;
      if (courseRes.data.success) {
        loadedCourse = courseRes.data.data;
        setCourse(loadedCourse);
      } else {
        setLoading(false);
        return;
      }

      // 2. Kiểm tra đã mua chưa
      const enrollRes = await getMyEnrolledCourses();
      let enrolled = false;
      if (enrollRes.data?.success && enrollRes.data.data) {
        enrolled = enrollRes.data.data.some((c) => c.slug === slug);
        setIsEnrolled(enrolled);
      }

      // 3. Set bài học đầu tiên mặc định
      const curriculum = loadedCourse?.curriculum?.length > 0 ? loadedCourse.curriculum : defaultCurriculum;
      if (curriculum.length > 0 && curriculum[0].lessons.length > 0) {
        setActiveLesson({
          ...curriculum[0].lessons[0],
          chapterIndex: 0,
          lessonIndex: 0
        });
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = (lessonId) => {
    const newProgress = new Set(progress);
    if (newProgress.has(lessonId)) {
      newProgress.delete(lessonId);
    } else {
      newProgress.add(lessonId);
    }
    setProgress(newProgress);
    localStorage.setItem(`progress_${slug}`, JSON.stringify([...newProgress]));
  };

  const handleLessonSelect = (lesson, sIdx, lIdx) => {
    const isLocked = !isEnrolled && sIdx !== 0; // Chương 1 free
    if (isLocked) {
      alert("Vui lòng mua khóa học để mở khóa bài giảng này!");
      navigate(`/courses/${course.slug}`);
      return;
    }
    setActiveLesson({ ...lesson, chapterIndex: sIdx, lessonIndex: lIdx });
  };

  if (loading) {
    return (
      <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div className="spinner spinner-large"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Không tìm thấy khóa học</h2>
        <Link to="/courses" className="btn btn-primary">Quay lại</Link>
      </div>
    );
  }

  const curriculum = course.curriculum?.length > 0 ? course.curriculum : defaultCurriculum;
  
  // Tính tổng tiến độ
  const totalLessons = curriculum.reduce((acc, curr) => acc + curr.lessons.length, 0);
  const completedCount = progress.size;
  const progressPercent = Math.round((completedCount / totalLessons) * 100) || 0;

  return (
    <div style={{ display: "flex", height: "calc(100vh - 60px)", background: "#f8fafc", color: "#0f172a", fontFamily: "var(--font)" }}>
      {/* ===== HEADER BAR ===== */}
      <div style={{ position: "fixed", top: "60px", left: 0, width: "100%", height: "50px", background: "#ffffff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", padding: "0 20px", zIndex: 10 }}>
        <Link to={`/courses/${course.slug}`} style={{ color: "#64748b", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px", fontWeight: "600" }}>
          <span>← Thoát chế độ học</span>
        </Link>
        <span style={{ margin: "0 16px", color: "#cbd5e1" }}>|</span>
        <h2 style={{ fontSize: "1rem", margin: 0, fontWeight: "600", flex: 1 }}>{course.title}</h2>
        
        {/* Progress Bar Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>{progressPercent}% Hoàn thành</span>
          <div style={{ width: "150px", height: "6px", background: "#e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
            <div style={{ width: `${progressPercent}%`, height: "100%", background: "#10b981", transition: "width 0.3s ease" }}></div>
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT AREA ===== */}
      <div style={{ flex: 1, padding: "70px 40px 40px", overflowY: "auto", display: "flex", flexDirection: "column", background: "#ffffff" }}>
        
        {activeLesson?.type === 'document' ? (
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "24px", color: "#0f172a", display: "flex", alignItems: "center", gap: "12px" }}>
              <Icon name="star" size={24} />
              {activeLesson.title}
            </h1>
            {activeLesson.docUrl ? (
              <iframe src={activeLesson.docUrl} style={{ width: "100%", height: "800px", border: "1px solid #e2e8f0", borderRadius: "12px" }} title="Tài liệu" />
            ) : (
              <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.8, fontSize: "1.1rem", color: "#334155", maxWidth: "800px" }}>
                {activeLesson.content}
              </div>
            )}
          </div>
        ) : (
          <div style={{ flex: 1, background: "#000", borderRadius: "12px", overflow: "hidden", position: "relative", minHeight: "500px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)" }}>
            {activeLesson ? (
              <iframe 
                src={activeLesson.videoUrl || "https://www.youtube.com/embed/SqcY0GlETPk"} 
                title={activeLesson.title}
                style={{ width: "100%", height: "100%", border: "none", position: "absolute", top: 0, left: 0 }}
                allowFullScreen
              ></iframe>
            ) : (
              <div style={{ display: "flex", height: "100%", justifyContent: "center", alignItems: "center", color: "#6b7280" }}>
                Vui lòng chọn một bài học
              </div>
            )}
          </div>
        )}

        {/* THÔNG TIN & ĐÁNH DẤU HOÀN THÀNH */}
        <div style={{ marginTop: "24px", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "24px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", margin: "0 0 8px 0" }}>{activeLesson?.title || "Tổng quan"}</h1>
            <p style={{ color: "#64748b", margin: 0 }}>
              {activeLesson?.type === 'video' ? "Thưởng thức video bài giảng." : "Hãy đọc kỹ tài liệu thực hành."}
            </p>
          </div>
          
          {/* NÚT THÀNH CÔNG */}
          {activeLesson && (
            <button 
              onClick={() => handleToggleComplete(activeLesson.id || activeLesson.title)}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "10px 16px",
                border: progress.has(activeLesson.id || activeLesson.title) ? "1px solid #10b981" : "1px solid #cbd5e1",
                background: progress.has(activeLesson.id || activeLesson.title) ? "rgba(16, 185, 129, 0.1)" : "white",
                color: progress.has(activeLesson.id || activeLesson.title) ? "#059669" : "#64748b",
                borderRadius: "8px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s"
              }}
            >
              {progress.has(activeLesson.id || activeLesson.title) ? (
                <>
                  <Icon name="checkCircle" size={18} />
                  Đã hoàn thành
                </>
              ) : (
                <>
                  <Icon name="circle" size={18} />
                  Đánh dấu hoàn thành
                </>
              )}
            </button>
          )}
        </div>

        {/* TÀI LIỆU ĐÍNH KÈM / LÝ THUYẾT */}
        {activeLesson?.resources && activeLesson.resources.length > 0 && (
          <div style={{ marginTop: "20px", background: "#f1f5f9", border: "1px dashed #cbd5e1", padding: "20px", borderRadius: "12px" }}>
            <h3 style={{ fontSize: "1.1rem", margin: "0 0 16px 0", color: "#334155", display: "flex", alignItems: "center", gap: "10px" }}>
              <Icon name="settings" size={18} />
              Link tài liệu & Lý thuyết đính kèm
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {activeLesson.resources.map((url, idx) => {
                const isPdf = url.includes('.pdf');
                const title = url.split('/').pop() || `Tài liệu đính kèm ${idx + 1}`;
                return (
                  <a 
                    key={idx} 
                    href={url} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", textDecoration: "none", color: "#2563eb", fontWeight: "600", transition: "all 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center" }}>
                      <Icon name={isPdf ? "lock" : "chevronRight"} size={18} />
                    </span>
                    {title}
                    <span style={{ marginLeft: "auto", fontSize: "0.85rem", color: "#94a3b8", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      Mở liên kết <Icon name="chevronRight" size={16} />
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {!isEnrolled && (
          <div style={{ marginTop: "20px", padding: "16px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid #10b981", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong style={{ color: "#10b981", display: "block" }}>Bạn đang xem trước miễn phí</strong>
              <span style={{ fontSize: "0.85rem", color: "#6ee7b7" }}>Để mở khóa toàn bộ bài giảng (Chương 2 trở đi), vui lòng đăng ký khóa học.</span>
            </div>
            <button 
              onClick={() => navigate(`/checkout?course=${course.slug}`)}
              style={{ padding: "10px 20px", background: "#10b981", color: "white", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
            >
              Mua ngay
            </button>
          </div>
        )}
      </div>

      {/* ===== SIDEBAR CURRICULUM ===== */}
      <div style={{ width: "350px", background: "#ffffff", borderLeft: "1px solid #e2e8f0", display: "flex", flexDirection: "column", marginTop:"50px" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid #e2e8f0", flexShrink: 0 }}>
          <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#0f172a" }}>Nội dung bài học</h3>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
          {curriculum.map((section, sIdx) => {
            const isSectionLocked = !isEnrolled && sIdx !== 0;

            return (
              <div key={sIdx} style={{ marginBottom: "12px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
                <div 
                  onClick={() => setExpandedSection(expandedSection === sIdx ? -1 : sIdx)}
                  style={{ padding: "16px", background: expandedSection === sIdx ? "#f1f5f9" : "#ffffff", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "background 0.2s" }}
                >
                  <div>
                    <div style={{ fontWeight: "600", fontSize: "0.95rem", color: "#0f172a" }}>{section.title}</div>
                    <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "4px" }}>
                      {section.lessons.length} bài học
                    </div>
                  </div>
                </div>

                {expandedSection === sIdx && (
                  <div style={{ background: "#ffffff" }}>
                    {section.lessons.map((lesson, lIdx) => {
                      const isActive = activeLesson?.chapterIndex === sIdx && activeLesson?.lessonIndex === lIdx;
                      const isCompleted = progress.has(lesson.id || lesson.title);
                      
                      return (
                        <div 
                          key={lIdx} 
                          onClick={() => handleLessonSelect(lesson, sIdx, lIdx)}
                          style={{ 
                            padding: "14px 16px", 
                            borderTop: "1px solid #e2e8f0", 
                            cursor: "pointer",
                            background: isActive ? "#eff6ff" : "transparent",
                            color: isActive ? "#2563eb" : "#475569",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            transition: "background 0.2s"
                          }}
                        >
                          {/* MÀU XANH NẾU HOÀN THÀNH, Ổ KHÓA NẾU BỊ KHÓA */}
                          <div style={{ flexShrink: 0 }}>
                            {isCompleted ? (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="#10b981"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1.959 17l-4.5-4.319 1.395-1.435 3.08 2.937 7.021-7.183 1.422 1.409-8.418 8.591z"/></svg>
                            ) : isSectionLocked ? (
                              <span style={{ display: "inline-flex", alignItems: "center", color: "#cbd5e1" }}>
                                <Icon name="lock" size={16} />
                              </span>
                            ) : (
                              <span style={{ display: "inline-flex", alignItems: "center", color: isActive ? "#2563eb" : "#94a3b8" }}>
                                <Icon name={lesson.type === "document" ? "settings" : "chevronRight"} size={16} />
                              </span>
                            )}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "0.9rem", fontWeight: isActive ? "600" : "400", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: isActive ? "#1e40af" : "#334155" }}>
                              {lesson.title}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "4px" }}>
                              {lesson.type === 'document' ? 'Đọc tư liệu' : `${lesson.duration || 0} phút`}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
