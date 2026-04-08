// ================================================
// MODEL: Course - Khóa học
// Mô tả: Lưu trữ thông tin khóa học bao gồm nội dung, giá, giảng viên
// ================================================
const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    // Tiêu đề bài học
    title: { type: String, required: true, trim: true },
    // Nội dung mô tả bài học
    description: { type: String, default: "" },
    // URL video bài học (YouTube, Vimeo, hoặc file)
    videoUrl: { type: String, default: "" },
    // Thứ tự hiển thị bài học
    order: { type: Number, default: 0 },
    // Thời lượng bài học (phút)
    duration: { type: Number, default: 0 },
    // Có phải bài học mẫu miễn phí không
    isFreePreview: { type: Boolean, default: false },
    // Tài liệu đính kèm (mảng URL)
    resources: [{ type: String }],
  },
  { _id: true, timestamps: false }
);

const sectionSchema = new mongoose.Schema(
  {
    // Tiêu đề phần (ví dụ: "Chương 1: Giới thiệu")
    title: { type: String, required: true, trim: true },
    // Thứ tự phần
    order: { type: Number, default: 0 },
    // Danh sách bài học trong phần
    lessons: [lessonSchema],
  },
  { _id: true, timestamps: false }
);

const attachmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true, trim: true },
  },
  { _id: true, timestamps: false }
);

const reviewSchema = new mongoose.Schema(
  {
    // Người đánh giá (ObjectId reference User)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Số sao đánh giá (1-5)
    rating: { type: Number, required: true, min: 1, max: 5 },
    // Nội dung nhận xét
    comment: { type: String, default: "", maxlength: 1000 },
    // Ngày tạo
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true, timestamps: false }
);

// ================================================
// SCHEMA CHÍNH: Course
// ================================================
const CourseSchema = new mongoose.Schema(
  {
    // Tiêu đề khóa học (bắt buộc)
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // Slug URL thân thiện (duy nhất, ví dụ: "reactjs-co-ban")
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Mô tả chi tiết khóa học
    description: {
      type: String,
      required: true,
    },
    // Giá khóa học (VNĐ, 0 = miễn phí)
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    // Giá khuyến mãi (nếu có)
    discountPrice: {
      type: Number,
      default: null,
      min: 0,
    },
    // Danh mục khóa học (liên kết với Category)
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    // Giảng viên (liên kết với User)
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // Tên giảng viên (lưu trữ text để hiển thị nhanh)
    authorName: {
      type: String,
      default: "DevMaster Team",
    },
    // Ảnh bìa khóa học (URL)
    image: {
      type: String,
      default: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
    },
    // Cấp độ khóa học
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", "All Levels"],
      default: "Beginner",
    },
    // Ngôn ngữ giảng dạy
    language: {
      type: String,
      default: "english",
    },
    // Số lượng học viên đã đăng ký
    enrolledCount: {
      type: Number,
      default: 0,
    },
    // Tổng số bài học
    totalLessons: {
      type: Number,
      default: 0,
    },
    // Tổng thời lượng khóa học (phút)
    totalDuration: {
      type: Number,
      default: 0,
    },
    // Tài liệu đính kèm của khóa học
    attachments: [attachmentSchema],
    // Danh sách phần và bài học
    curriculum: [sectionSchema],
    // Mảng đánh giá từ học viên
    reviews: [reviewSchema],
    // Điểm trung bình đánh giá (tính tự động)
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    // Tổng số đánh giá
    totalReviews: {
      type: Number,
      default: 0,
    },
    // Yêu cầu trước khi học (ví dụ: "Có kiến thức JavaScript cơ bản")
    prerequisites: {
      type: String,
      default: "",
    },
    // Học được gì sau khóa học
    whatYouLearn: {
      type: String,
      default: "",
    },
    // Trạng thái: draft / published / archived
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    // Khóa học nổi bật (hiển thị trên trang chủ)
    isFeatured: {
      type: Boolean,
      default: false,
    },
    // Danh sách tag để tìm kiếm
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
  },
  { timestamps: true }
);

// ================================================
// INDEX: Tạo index để tìm kiếm nhanh
// ================================================
CourseSchema.index({ title: "text", description: "text", tags: "text" }, { default_language: "english" });
CourseSchema.index({ category: 1 });
CourseSchema.index({ instructor: 1 });
CourseSchema.index({ status: 1 });
CourseSchema.index({ price: 1 });
CourseSchema.index({ averageRating: -1 });
CourseSchema.index({ enrolledCount: -1 });

module.exports = mongoose.model("Course", CourseSchema);
