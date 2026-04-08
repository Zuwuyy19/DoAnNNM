import { useState, useRef } from "react";
import Icon from "./Icon";
import { uploadFile } from "../services/uploadService";

export default function CourseAttachmentsEditor({ attachments = [], onChange }) {
  const [uploadingIdx, setUploadingIdx] = useState(null);
  const fileInputRef = useRef(null);

  const addAttachment = () => {
    onChange([...attachments, { title: "", fileUrl: "" }]);
  };

  const updateAttachment = (idx, key, value) => {
    const updated = [...attachments];
    updated[idx] = { ...updated[idx], [key]: value };
    onChange(updated);
  };

  const removeAttachment = (idx) => {
    onChange(attachments.filter((_, i) => i !== idx));
  };

  const handleFileUpload = async (idx, event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadingIdx(idx);
    try {
      const res = await uploadFile(file);
      if (res.data.success) {
        const { url, originalName } = res.data.data;
        const updated = [...attachments];
        
        // Auto-fill title if empty
        if (!updated[idx].title) {
          updated[idx].title = originalName.split('.').slice(0, -1).join('.') || originalName;
        }
        
        updated[idx].fileUrl = url;
        onChange(updated);
      } else {
        alert(res.data.message || "Tải lên thất bại!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Lỗi kết nối khi tải file lên máy chủ!");
    } finally {
      setUploadingIdx(null);
      // Reset input value to allow uploading the same file again if needed
      event.target.value = "";
    }
  };

  return (
    <div className="course-attachments-editor" style={{ marginBottom: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <h3 style={{ fontSize: "1rem", color: "var(--admin-text-primary)", fontWeight: "600" }}>
          Tài liệu đính kèm khóa học (Course Attachments)
        </h3>
        <button type="button" className="btn btn-outline btn-sm" onClick={addAttachment}>
          + Thêm tài liệu
        </button>
      </div>

      {attachments.length === 0 ? (
        <div style={{ padding: "16px", textAlign: "center", background: "var(--admin-bg)", borderRadius: "8px", border: "1px dashed var(--admin-border)", color: "var(--admin-text-secondary)", fontSize: "0.85rem" }}>
          Chưa có tài liệu đính kèm nào. Click "+ Thêm tài liệu" để đăng file từ máy tính.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {attachments.map((file, idx) => (
            <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "12px", border: "1px solid var(--admin-border)", borderRadius: "6px", background: "var(--admin-white)" }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
                
                {/* Dòng 1: Tiêu đề */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "600", minWidth: "100px" }}>Tên tài liệu:</label>
                  <input
                    type="text"
                    value={file.title}
                    onChange={(e) => updateAttachment(idx, "title", e.target.value)}
                    placeholder="VD: Slide bài giảng PowerPoint (.pptx)"
                    style={{ flex: 1, padding: "8px 10px", border: "1px solid var(--admin-border)", borderRadius: "4px", fontSize: "0.9rem" }}
                  />
                </div>

                {/* Dòng 2: Upload File hoặc nhập Url */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "600", minWidth: "100px" }}>File nguồn:</label>
                  
                  {/* Nếu đang upload */}
                  {uploadingIdx === idx ? (
                    <div style={{ padding: "8px", flex: 1, fontSize: "0.85rem", color: "#3b82f6", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span className="spinner" style={{ width: "16px", height: "16px", border: "2px solid currentColor", borderRightColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></span>
                      Đang tải lên máy chủ...
                    </div>
                  ) : (
                    <div style={{ flex: 1, display: "flex", gap: "8px" }}>
                      {/* Ẩn input file */}
                      <input 
                        type="file" 
                        id={`file-upload-${idx}`}
                        style={{ display: "none" }}
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar"
                        onChange={(e) => handleFileUpload(idx, e)}
                      />
                      {/* Nút giả để trigger chọn file */}
                      <label htmlFor={`file-upload-${idx}`} className="btn btn-outline" style={{ cursor: "pointer", padding: "6px 12px", whiteSpace: "nowrap" }}>
                        <Icon name="search" size={16} /> Chọn File
                      </label>
                      
                      {/* Ô nhập fallback (không disable để họ xem URL) */}
                      <input
                        type="text"
                        value={file.fileUrl || ""}
                        onChange={(e) => updateAttachment(idx, "fileUrl", e.target.value)}
                        placeholder="...hoặc đường dẫn URL (sẽ tự điền khi upload)"
                        style={{ flex: 1, padding: "6px 10px", border: "1px solid var(--admin-border)", borderRadius: "4px", fontSize: "0.85rem", background: "#f8fafc" }}
                      />
                    </div>
                  )}
                </div>

              </div>
              <button 
                type="button" 
                onClick={() => removeAttachment(idx)} 
                className="btn-action" 
                style={{ color: "var(--admin-danger)", padding: "8px", background: "none", border: "none", cursor: "pointer", marginTop: "4px" }} 
                title="Xóa tài liệu"
              >
                <Icon name="trash" size={18} />
              </button>
            </div>
          ))}
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
