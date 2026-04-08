// ================================================
// MODEL: User - Người dùng hệ thống
// Mô tả: Lưu trữ thông tin người dùng (học viên, giảng viên, quản trị)
// ================================================
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Họ tên người dùng (bắt buộc)
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Email đăng nhập (duy nhất, bắt buộc)
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Mật khẩu đã mã hóa bcrypt (bắt buộc)
    password: {
      type: String,
      required: true,
    },
    // Vai trò: 'user' (học viên), 'instructor' (giảng viên), 'admin' (quản trị)
    role: {
      type: String,
      enum: ["user", "instructor", "admin"],
      default: "user",
    },
    // Ảnh đại diện (URL)
    avatar: {
      type: String,
      default: "",
    },
    // Số điện thoại liên hệ
    phone: {
      type: String,
      default: "",
    },
    // Tiểu sử giới thiệu bản thân
    bio: {
      type: String,
      default: "",
      maxlength: 500,
    },
    // Danh sách khóa học đã đăng ký (ObjectId)
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    // Danh sách khóa học yêu thích (Wishlist)
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    // Trạng thái tài khoản: active / banned
    isActive: {
      type: Boolean,
      default: true,
    },
    // Token đặt lại mật khẩu
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    // Token xác thực email
    emailVerificationToken: String,
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ================================================
// INDEX: Tạo index cho tìm kiếm nhanh theo email và name
// ================================================
userSchema.index({ email: 1 });
userSchema.index({ name: "text", email: "text" });

module.exports = mongoose.model("User", userSchema);
