const mongoose = require("mongoose");

const ProgressSchema = new mongoose.Schema(
  {
    // Người học (ObjectId reference User)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Khóa học đang học (ObjectId reference Course)
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    // Danh sách các ID bài học đã hoàn thành
    // Lưu ID dưới dạng String để linh hoạt (ObjectId string)
    completedLessons: [
      {
        type: String,
      },
    ],
    // Bài học cuối cùng đang xem
    lastAccessedLesson: {
      type: String,
      default: null,
    },
    // Vị trí giây cuối cùng của video (nếu có)
    lastVideoPosition: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Mỗi user chỉ có 1 bản ghi progress cho mỗi khóa học
ProgressSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("Progress", ProgressSchema);
