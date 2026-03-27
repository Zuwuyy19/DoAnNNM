import api from "./api";

const courseService = {
  getAllCourses: async (category = "") => {
    let url = "/courses";
    if (category) {
      url += `?category=${category}`;
    }
    const response = await api.get(url);
    return response.data;
  },
  getCourseBySlug: async (slug) => {
    const response = await api.get(`/courses/${slug}`);
    return response.data;
  },
};

export default courseService;
