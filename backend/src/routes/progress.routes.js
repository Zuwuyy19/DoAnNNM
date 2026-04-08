const express = require("express");
const router = express.Router();
const {
  toggleLessonProgress,
  getUserProgress,
  getInstructorCourseReport,
} = require("../controllers/progress.controller");
const { verifyToken, requireInstructor } = require("../middlewares/auth.middleware");

// ================================================
// TẤT CẢ ROUTES DƯỚI ĐÂY ĐỀU CẦN ĐĂNG NHẬP
// ================================================
router.use(verifyToken);

// Update/Toggle tiến độ bài học
// POST /api/progress/toggle
router.post("/toggle", toggleLessonProgress);

// Lấy tiến độ của user hiện tại trong 1 khóa học
// GET /api/progress/:courseId
router.get("/:courseId", getUserProgress);

// Giảng viên xem báo cáo tiến độ học viên của khóa học mình dạy
// GET /api/progress/course/:courseId/report
router.get("/course/:courseId/report", getInstructorCourseReport);

module.exports = router;
