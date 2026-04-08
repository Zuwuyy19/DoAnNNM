// ================================================
// CONTROLLER: Auth - Xác thực người dùng
// Mô tả: Xử lý đăng ký, đăng nhập, logout, quên mật khẩu
// ================================================
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// ================================================
// FEATURE 1: Đăng ký tài khoản mới
// Input: name, email, password
// Output: Thông báo thành công hoặc lỗi
// ================================================
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin bắt buộc",
      });
    }

    // Kiểm tra email đã tồn tại chưa
    const existUser = await User.findOne({ email: email.toLowerCase() });
    if (existUser) {
      return res.status(400).json({
        success: false,
        message: "Email này đã được sử dụng. Vui lòng chọn email khác.",
      });
    }

    // Kiểm tra độ dài mật khẩu (tối thiểu 6 ký tự)
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải có ít nhất 6 ký tự",
      });
    }

    // Mã hóa mật khẩu bằng bcrypt (salt = 10 vòng)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo tài khoản mới với vai trò mặc định là 'user'
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "user",
    });

    res.status(201).json({
      success: true,
      message: "Đăng ký tài khoản thành công! Vui lòng đăng nhập.",
    });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server. Vui lòng thử lại sau.",
    });
  }
};

// ================================================
// FEATURE 2: Đăng nhập
// Input: email, password
// Output: JWT token + thông tin user
// ================================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm user theo email (chuyển về chữ thường để so sánh)
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    // Kiểm tra tài khoản có bị khóa không
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Tài khoản của bạn đã bị khóa. Liên hệ hỗ trợ.",
      });
    }

    // So sánh mật khẩu nhập vào với mật khẩu đã mã hóa trong DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    // Tạo JWT token chứa thông tin user (id, role) - hết hạn sau 7 ngày
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // Trả về token và thông tin user (không trả về password)
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server. Vui lòng thử lại sau.",
    });
  }
};

// ================================================
// FEATURE 3: Lấy thông tin Profile người dùng đang đăng nhập
// Input: Token trong header (Bearer token) - qua middleware
// Output: Thông tin chi tiết user (bao gồm khóa học đã đăng ký)
// ================================================
exports.getProfile = async (req, res) => {
  try {
    // req.user được gán từ middleware xác thực token ở bước trước
    const user = await User.findById(req.user.id)
      .select("-password") // Loại bỏ password khỏi kết quả trả về
      .populate("enrolledCourses", "title slug image price averageRating")
      .populate("wishlist", "title slug image price averageRating");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Lỗi lấy profile:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// ================================================
// FEATURE 4: Cập nhật thông tin Profile
// Input: name, avatar, phone, bio từ body request
// Output: User đã được cập nhật (không có password)
// ================================================
exports.updateProfile = async (req, res) => {
  try {
    const { name, avatar, phone, bio } = req.body;

    // Tìm và cập nhật user theo id từ token
    // new: true -> trả về document sau khi update
    // runValidators: true -> chạy validation schema
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, avatar, phone, bio },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({
      success: true,
      message: "Cập nhật hồ sơ thành công",
      data: user,
    });
  } catch (error) {
    console.error("Lỗi cập nhật profile:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// ================================================
// FEATURE 5: Đổi mật khẩu
// Input: currentPassword (mật khẩu hiện tại), newPassword (mật khẩu mới)
// Output: Thông báo thành công
// ================================================
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Lấy user từ DB để so sánh mật khẩu hiện tại
    const user = await User.findById(req.user.id);

    // Xác minh mật khẩu hiện tại có đúng không
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu hiện tại không đúng",
      });
    }

    // Kiểm tra mật khẩu mới có độ dài hợp lệ không
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu mới phải có ít nhất 6 ký tự",
      });
    }

    // Mã hóa mật khẩu mới và lưu (dùng save() để trigger pre-save hook)
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({
      success: true,
      message: "Đổi mật khẩu thành công",
    });
  } catch (error) {
    console.error("Lỗi đổi mật khẩu:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// ================================================
// FEATURE 6: Quên mật khẩu - Tạo token reset
// Input: email
// Output: Thông báo gửi email reset (DEV: trả về token để test)
// ================================================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Luôn trả thành công để tránh lộ thông tin user có tồn tại hay không
    // (prevent user enumeration attack)
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.json({
        success: true,
        message:
          "Nếu email tồn tại trong hệ thống, liên kết đặt lại mật khẩu đã được gửi.",
      });
    }

    // Tạo token reset ngẫu nhiên 32 bytes (hex = 64 ký tự)
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Lưu token đã băm (sha256) và thời gian hết hạn (1 giờ)
    // Dùng createHash để băm token trước khi lưu vào DB (bảo mật)
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 giờ
    await user.save();

    // Trong production: gửi email chứa resetToken qua nodemailer
    // Ví dụ: await sendResetEmail(user.email, resetToken);

    res.json({
      success: true,
      message:
        "Nếu email tồn tại trong hệ thống, liên kết đặt lại mật khẩu đã được gửi.",
      // ⚠️ DEV ONLY: Trả về token để test (XÓA trong production!)
      resetToken: resetToken,
    });
  } catch (error) {
    console.error("Lỗi quên mật khẩu:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// ================================================
// FEATURE 7: Reset mật khẩu với token
// Input: token (từ email), newPassword
// Output: Thông báo thành công, yêu cầu đăng nhập lại
// ================================================
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Băm token gửi lên để so sánh với token đã lưu (đã băm trong DB)
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Tìm user có token khớp VÀ chưa hết hạn
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }, // $gt = greater than
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Token không hợp lệ hoặc đã hết hạn",
      });
    }

    // Cập nhật mật khẩu mới và xóa token reset
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập.",
    });
  } catch (error) {
    console.error("Lỗi reset mật khẩu:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// ================================================
// FEATURE 8: Lấy danh sách học viên (Admin only)
// Input: Query params: page, limit, role, search
// Output: Danh sách user có phân trang
// ================================================
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;

    // Xây dựng query filter động theo tham số
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      // Tìm kiếm không phân biệt hoa thường theo tên hoặc email
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Đếm tổng số user phù hợp (dùng cho pagination)
    const total = await User.countDocuments(filter);

    // Lấy danh sách user với phân trang
    // skip: bỏ qua N bản ghi đầu, limit: lấy tối đa N bản ghi
    const users = await User.find(filter)
      .select("-password") // Không trả password về frontend
      .sort({ createdAt: -1 }) // Sắp xếp mới nhất trước
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách users:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// ================================================
// FEATURE 9: Thay đổi vai trò người dùng (Admin only)
// Input: userId từ URL params, role từ body
// Output: User đã được cập nhật vai trò mới
// ================================================
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Chỉ chấp nhận 3 vai trò: user, instructor, admin
    if (!["user", "instructor", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Vai trò không hợp lệ. Chỉ chấp nhận: user, instructor, admin",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    res.json({
      success: true,
      message: "Cập nhật vai trò thành công",
      data: user,
    });
  } catch (error) {
    console.error("Lỗi cập nhật vai trò:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// ================================================
// FEATURE 10: Khóa/Mở tài khoản người dùng (Admin only)
// Input: userId từ URL params
// Output: Toggle trạng thái isActive của user
// ================================================
exports.toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    // Ngăn chặn admin tự khóa chính mình
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Bạn không thể tự khóa tài khoản của chính mình",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // Đảo ngược trạng thái isActive
    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: user.isActive
        ? "Tài khoản đã được kích hoạt trở lại"
        : "Tài khoản đã bị khóa thành công",
      data: {
        id: user._id,
        isActive: user.isActive
      },
    });
  } catch (error) {
    console.error("Lỗi toggle user status:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi thay đổi trạng thái tài khoản",
    });
  }
};
// ================================================
// FEATURE 11: Xóa người dùng (Admin only)
// Input: userId từ URL params
// Output: Xác nhận xóa thành công
// ================================================
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Ngăn chặn admin tự xóa chính mình
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Bạn không thể tự xóa tài khoản của chính mình",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng để xóa",
      });
    }

    // Ngăn chặn xóa tài khoản Admin khác (Tùy chọn bảo mật)
    if (user.role === 'admin' && req.user.role !== 'admin') {
       return res.status(403).json({ success: false, message: "Bạn không có quyền xóa tài khoản Quản trị viên khác" });
    }

    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: "Đã xóa người dùng thành công khỏi hệ thống",
    });
  } catch (error) {
    console.error("Lỗi xóa người dùng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi thực hiện xóa tài khoản",
    });
  }
};
