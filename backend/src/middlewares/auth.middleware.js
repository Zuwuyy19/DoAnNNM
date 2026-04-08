// ================================================
// MIDDLEWARE: auth.middleware.js - Xác thực JWT Token
// Mô tả: Kiểm tra và giải mã JWT token từ header Authorization
// ================================================
const jwt = require("jsonwebtoken");

// ================================================
// verifyToken: Xác thực người dùng đã đăng nhập
// Kiểm tra header "Authorization: Bearer <token>"
// Gán thông tin user vào req.user sau khi giải mã thành công
// ================================================
const verifyToken = (req, res, next) => {
  // Lấy header Authorization (format: "Bearer <token>")
  const authHeader = req.headers.authorization;

  // Nếu không có header hoặc header không đúng format -> trả lỗi 401
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Không có token xác thực. Vui lòng đăng nhập.",
    });
  }

  try {
    // Tách token ra khỏi chuỗi "Bearer <token>"
    const token = authHeader.split(" ")[1];

    // Giải mã token bằng ACCESS_TOKEN_SECRET
    // Nếu token hết hạn hoặc bị sửa -> ném lỗi
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Gán thông tin user đã giải mã vào req.user
    // decoded chứa: { id: ObjectId, role: String, iat: timestamp, exp: timestamp }
    req.user = decoded;
    next(); // Chuyển sang middleware/route tiếp theo
  } catch (error) {
    // Các lỗi có thể xảy ra: TokenExpiredError, JsonWebTokenError
    return res.status(403).json({
      success: false,
      message: "Token không hợp lệ hoặc đã hết hạn",
    });
  }
};

// ================================================
// requireAdmin: Chỉ cho phép người có vai trò 'admin'
// Dùng SAU verifyToken (đảm bảo req.user đã tồn tại)
// ================================================
const requireAdmin = (req, res, next) => {
  // Kiểm tra req.user tồn tại (đã qua verifyToken)
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Vui lòng đăng nhập",
    });
  }

  // Kiểm tra vai trò là admin
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Bạn không có quyền thực hiện thao tác này. Yêu cầu quyền Admin.",
    });
  }

  next(); // Cho phép đi tiếp
};

// ================================================
// requireInstructor: Cho phép admin HOẶC instructor
// ================================================
const requireInstructor = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Vui lòng đăng nhập",
    });
  }

  if (req.user.role !== "admin" && req.user.role !== "instructor") {
    return res.status(403).json({
      success: false,
      message: "Chỉ giảng viên hoặc admin mới có thể thực hiện thao tác này",
    });
  }

  next();
};

// ================================================
// optionalAuth: Xác thực tùy chọn (có token thì giải mã, không thì bỏ qua)
// Dùng cho các route public nhưng muốn nhận biết user đã đăng nhập
// ================================================
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // Không có token -> vẫn cho đi tiếp, req.user = undefined
    return next();
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
  } catch (error) {
    // Token lỗi -> vẫn cho đi tiếp, bỏ qua lỗi
    req.user = undefined;
  }

  next();
};

module.exports = {
  verifyToken,
  requireAdmin,
  requireInstructor,
  optionalAuth,
};
