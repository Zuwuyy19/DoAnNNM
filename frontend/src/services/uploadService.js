import api from "./api";

// ================================================
// FEATURE: Upload file (Word, PPTX, PDF,...)
// POST /api/upload
// ================================================
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  // Gửi request multipart/form-data
  return await api.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
