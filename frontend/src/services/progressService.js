import api from "./api";

/**
 * Lấy tiến độ của user hiện tại cho một khóa học cụ thể
 */
export const getUserProgress = (courseId) => {
  return api.get(`/progress/${courseId}`);
};

/**
 * Cập nhật (Toggle) trạng thái hoàn thành của một bài học
 */
export const toggleLessonProgress = (courseId, lessonId) => {
  return api.post("/progress/toggle", { courseId, lessonId });
};

/**
 * Giảng viên lấy báo cáo tiến độ của tất cả học viên trong khóa học
 */
export const getInstructorCourseReport = (courseId) => {
  return api.get(`/progress/course/${courseId}/report`);
};
