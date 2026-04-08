const Progress = require("../models/Progress");
const Course = require("../models/Course");
const User = require("../models/User");

// ================================================
// FEATURE: Cập nhật tiến độ bài học (Toggle Complete)
// ================================================
exports.toggleLessonProgress = async (req, res) => {
  try {
    const { courseId, lessonId } = req.body;
    const userId = req.user.id;

    let progress = await Progress.findOne({ user: userId, course: courseId });

    if (!progress) {
      // Nếu chưa có bản ghi, tạo mới
      progress = await Progress.create({
        user: userId,
        course: courseId,
        completedLessons: [lessonId],
      });
    } else {
      // Toggle bài học trong mảng completedLessons
      const index = progress.completedLessons.indexOf(lessonId);
      if (index > -1) {
        progress.completedLessons.splice(index, 1);
      } else {
        progress.completedLessons.push(lessonId);
      }
      await progress.save();
    }

    res.json({
      success: true,
      message: "Cập nhật tiến độ thành công",
      data: progress,
    });
  } catch (error) {
    console.error("Lỗi cập nhật tiến độ:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// ================================================
// FEATURE: Lấy tiến độ của user hiện tại trong 1 khóa học
// ================================================
exports.getUserProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const progress = await Progress.findOne({ user: userId, course: courseId });

    res.json({
      success: true,
      data: progress || { completedLessons: [] },
    });
  } catch (error) {
    console.error("Lỗi lấy tiến độ user:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// ================================================
// FEATURE: Giảng viên xem báo cáo tiến độ của tất cả học viên
// ================================================
exports.getInstructorCourseReport = async (req, res) => {
  try {
    const { courseId } = req.params;
    const instructorId = req.user.id;

    // 1. Kiểm tra quyền của giảng viên đối với khóa học này
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Không tìm thấy khóa học" });
    }

    // Admin hoặc Giảng viên sở hữu khóa học mới được xem
    if (course.instructor.toString() !== instructorId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Bạn không có quyền xem báo cáo này" });
    }

    // 2. Lấy tất cả bản ghi progress của khóa học này, populate thông tin User
    const studentProgress = await Progress.find({ course: courseId })
      .populate("user", "name email image")
      .sort({ updatedAt: -1 });

    // 3. Tính toán phần trăm hoàn thành cho từng học viên
    const totalLessons = course.curriculum.reduce((acc, curr) => acc + curr.lessons.length, 0);

    const report = studentProgress.map((p) => {
      const completedCount = p.completedLessons.length;
      const percent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
      
      return {
        user: p.user,
        completedCount,
        totalLessons,
        percent,
        updatedAt: p.updatedAt,
      };
    });

    res.json({
      success: true,
      data: {
        courseTitle: course.title,
        totalLessons,
        students: report,
      },
    });
  } catch (error) {
    console.error("Lỗi lấy báo cáo tiến độ giảng viên:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
