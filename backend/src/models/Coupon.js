// ================================================
// MODEL: Coupon - Mã giảm giá
// Mô tả: Lưu trữ mã giảm giá dùng khi đặt hàng
// ================================================
const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema(
  {
    // Mã giảm giá (duy nhất, không phân biệt hoa thường)
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    // Tên chiến dịch khuyến mãi
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Loại giảm giá: 'percent' (phần trăm) hoặc 'fixed' (số tiền cố định)
    discountType: {
      type: String,
      enum: ["percent", "fixed"],
      default: "percent",
    },
    // Giá trị giảm (nếu percent: 1-100, nếu fixed: số tiền VNĐ)
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    // Giá trị giảm tối đa (chỉ áp dụng khi discountType = percent)
    maxDiscountAmount: {
      type: Number,
      default: null,
    },
    // Số lượng mã có thể sử dụng (null = không giới hạn)
    usageLimit: {
      type: Number,
      default: null,
    },
    // Số lần đã sử dụng
    usedCount: {
      type: Number,
      default: 0,
    },
    // Số lần mỗi người dùng được sử dụng
    maxUsagePerUser: {
      type: Number,
      default: 1,
    },
    // Ngày bắt đầu có hiệu lực
    startDate: {
      type: Date,
      default: Date.now,
    },
    // Ngày hết hạn
    endDate: {
      type: Date,
      required: true,
    },
    // Áp dụng cho khóa học cụ thể (null = áp dụng tất cả)
    applicableCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    // Áp dụng cho danh mục cụ thể (null = áp dụng tất cả)
    applicableCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    // Trạng thái: active / inactive
    isActive: {
      type: Boolean,
      default: true,
    },
    // Người tạo (Admin)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// ================================================
// INDEX: Truy vấn nhanh theo mã
// ================================================
CouponSchema.index({ code: 1 });
CouponSchema.index({ isActive: 1, endDate: 1 });

module.exports = mongoose.model("Coupon", CouponSchema);
