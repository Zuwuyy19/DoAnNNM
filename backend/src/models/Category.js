// ================================================
// MODEL: Category - Danh mục khóa học
// Mô tả: Lưu trữ danh mục phân loại khóa học (Frontend, Backend, DevOps, ...)
// ================================================
const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    // Tên danh mục (duy nhất, bắt buộc)
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    // Slug URL thân thiện
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Mô tả danh mục
    description: {
      type: String,
      default: "",
    },
    // Icon CSS class (ví dụ: "fas fa-code")
    icon: {
      type: String,
      default: "fas fa-folder",
    },
    // Màu sắc hiển thị (HEX)
    color: {
      type: String,
      default: "#6366f1",
    },
    // Thứ tự sắp xếp hiển thị
    order: {
      type: Number,
      default: 0,
    },
    // Danh mục cha (nếu có, hỗ trợ danh mục lồng nhau)
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    // Trạng thái active / inactive
    isActive: {
      type: Boolean,
      default: true,
    },
    // Số lượng khóa học trong danh mục (tính tự động)
    courseCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// ================================================
// INDEX: Tạo index cho tìm kiếm nhanh
// ================================================
CategorySchema.index({ name: 1 });
CategorySchema.index({ slug: 1 });
CategorySchema.index({ order: 1 });

module.exports = mongoose.model("Category", CategorySchema);
