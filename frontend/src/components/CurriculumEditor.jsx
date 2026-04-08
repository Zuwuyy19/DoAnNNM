import { useState } from "react";
import Icon from "./Icon";

export default function CurriculumEditor({ curriculum = [], onChange }) {
  // ================================================
  // QUẢN LÝ CHƯƠNG (SECTION)
  // ================================================
  const addSection = () => {
    const newSection = {
      title: "Chương mới",
      order: curriculum.length + 1,
      lessons: [],
    };
    onChange([...curriculum, newSection]);
  };

  const updateSectionTitle = (sIdx, newTitle) => {
    const updated = [...curriculum];
    updated[sIdx].title = newTitle;
    onChange(updated);
  };

  const removeSection = (sIdx) => {
    if (!window.confirm("Bạn có chắc muốn xóa toàn bộ chương này và tất cả bài học bên trong?")) return;
    const updated = curriculum.filter((_, idx) => idx !== sIdx);
    onChange(updated);
  };

  // ================================================
  // QUẢN LÝ BÀI HỌC (LESSON)
  // ================================================
  const addLesson = (sIdx) => {
    const updated = [...curriculum];
    updated[sIdx].lessons.push({
      title: "Bài học mới",
      duration: 0,
      isFreePreview: false,
      videoUrl: "",
      order: updated[sIdx].lessons.length + 1,
    });
    onChange(updated);
  };

  const updateLesson = (sIdx, lIdx, key, value) => {
    const updated = [...curriculum];
    updated[sIdx].lessons[lIdx] = {
      ...updated[sIdx].lessons[lIdx],
      [key]: value,
    };
    onChange(updated);
  };

  const removeLesson = (sIdx, lIdx) => {
    if (!window.confirm("Xóa bài học này?")) return;
    const updated = [...curriculum];
    updated[sIdx].lessons = updated[sIdx].lessons.filter((_, idx) => idx !== lIdx);
    onChange(updated);
  };

  return (
    <div className="curriculum-editor" style={{ marginTop: "16px", marginBottom: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h3 style={{ fontSize: "1rem", color: "var(--admin-text-primary)", fontWeight: "600" }}>
          Nội dung khóa học (Curriculum)
        </h3>
        <button type="button" className="btn btn-outline btn-sm" onClick={addSection}>
          + Thêm chương mới
        </button>
      </div>

      {curriculum.length === 0 ? (
        <div style={{ padding: "20px", textAlign: "center", background: "var(--admin-bg)", borderRadius: "8px", border: "1px dashed var(--admin-border)", color: "var(--admin-text-secondary)" }}>
          Chưa có nội dung nào. Hãy thêm chương mới.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {curriculum.map((section, sIdx) => (
            <div key={sIdx} style={{ border: "1px solid var(--admin-border)", borderRadius: "8px", background: "var(--admin-white)", overflow: "hidden" }}>
              
              {/* Header Chương */}
              <div style={{ padding: "12px 16px", background: "#f8fafc", borderBottom: "1px solid var(--admin-border)", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontWeight: "700", color: "var(--admin-text-secondary)" }}>Chương {sIdx + 1}:</span>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateSectionTitle(sIdx, e.target.value)}
                    style={{ flex: 1, padding: "6px 12px", border: "1px solid var(--admin-border)", borderRadius: "4px", outline: "none", fontSize: "0.9rem" }}
                    placeholder="Tên chương..."
                  />
                </div>
                <button type="button" onClick={() => removeSection(sIdx)} className="btn-action" style={{ color: "var(--admin-danger)", padding: "6px", background: "none" }} title="Xóa chương">
                  <Icon name="trash" size={16} />
                </button>
              </div>

              {/* Danh sách bài học */}
              <div style={{ padding: "16px" }}>
                {section.lessons && section.lessons.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
                    {section.lessons.map((lesson, lIdx) => (
                      <div key={lIdx} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "6px", background: "#fafafa" }}>
                        
                        <div style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--admin-text-secondary)" }}>Bài {lIdx + 1}</span>
                          <input
                            type="text"
                            value={lesson.title}
                            onChange={(e) => updateLesson(sIdx, lIdx, "title", e.target.value)}
                            placeholder="Tiêu đề bài học..."
                            style={{ flex: 1, padding: "6px 10px", border: "1px solid var(--admin-border)", borderRadius: "4px", fontSize: "0.85rem" }}
                          />
                          <button type="button" onClick={() => removeLesson(sIdx, lIdx)} style={{ background: "none", border: "none", color: "var(--admin-danger)", cursor: "pointer", padding: "4px" }}>
                            <Icon name="trash" size={16} />
                          </button>
                        </div>
                        
                        <div style={{ width: "100%", display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <label style={{ fontSize: "0.8rem", color: "var(--admin-text-secondary)", fontWeight: "500" }}>Thời lượng (phút):</label>
                            <input
                              type="number"
                              value={lesson.duration || ""}
                              onChange={(e) => updateLesson(sIdx, lIdx, "duration", Number(e.target.value))}
                              style={{ width: "80px", padding: "4px 8px", border: "1px solid var(--admin-border)", borderRadius: "4px", fontSize: "0.85rem" }}
                              min="0"
                            />
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <input
                              type="checkbox"
                              id={`free-preview-${sIdx}-${lIdx}`}
                              checked={lesson.isFreePreview || false}
                              onChange={(e) => updateLesson(sIdx, lIdx, "isFreePreview", e.target.checked)}
                              style={{ cursor: "pointer" }}
                            />
                            <label htmlFor={`free-preview-${sIdx}-${lIdx}`} style={{ fontSize: "0.8rem", color: "var(--admin-text-secondary)", cursor: "pointer", fontWeight: "500" }}>Cho phép học thử (Free Preview)</label>
                          </div>

                          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "6px", minWidth: "200px" }}>
                            <label style={{ fontSize: "0.8rem", color: "var(--admin-text-secondary)", fontWeight: "500" }}>Video URL:</label>
                            <input
                              type="text"
                              value={lesson.videoUrl || ""}
                              onChange={(e) => updateLesson(sIdx, lIdx, "videoUrl", e.target.value)}
                              placeholder="https://..."
                              style={{ flex: 1, padding: "4px 8px", border: "1px solid var(--admin-border)", borderRadius: "4px", fontSize: "0.85rem" }}
                            />
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: "0.85rem", color: "var(--admin-text-muted)", marginBottom: "12px", fontStyle: "italic" }}>
                    Chương này chưa có bài học nào.
                  </div>
                )}
                
                <button type="button" onClick={() => addLesson(sIdx)} className="btn btn-outline btn-sm" style={{ fontSize: "0.8rem", padding: "4px 10px", borderColor: "#cbd5e1" }}>
                  + Thêm bài học
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
