const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Tạo thư mục uploads nếu chưa có
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình lưu trữ file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); 
  },
  filename: function (req, file, cb) {
    // Tạo tên file an toàn: thời gian + chuỗi ngẫu nhiên + extension gốc
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// Khởi tạo middleware multer (cho phép mọi loại file hoặc giới hạn tùy chọn)
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Giới hạn 50MB
}).single("file"); // "file" là tên thẻ input gửi lên

// ================================================
// API: Upload một file
// ================================================
exports.uploadFile = (req, res) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // Lỗi của multer (vd: file quá lớn)
      console.error("Multer error:", err);
      return res.status(400).json({ success: false, message: "Lỗi tải file: " + err.message });
    } else if (err) {
      // Lỗi khác
      console.error("Upload error:", err);
      return res.status(500).json({ success: false, message: "Lỗi server khi upload file" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Không tìm thấy file gửi lên" });
    }

    // Trả về url của file
    // Sử dụng địa chỉ gốc của server. Ở môi trường dev là localhost:5000
    const fileUrl = `${process.env.SERVER_URL || "http://localhost:5000"}/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: "Tải file thành công",
      data: {
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
      },
    });
  });
};
