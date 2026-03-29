import api from "./api";

export const getCourses = () => api.get("/courses");

export const getCourseDetail = (id) =>
  api.get(`/courses/${id}`);