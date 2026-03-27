import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import courseService from "../../services/courseService";
import categoryService from "../../services/categoryService";
import "../../styles/course.css";

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchCourses();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getAllCategories();
      if (res.success) setCategories(res.data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  const fetchCourses = async (category = "") => {
    setLoading(true);
    try {
      const res = await courseService.getAllCourses(category);
      if (res.success) setCourses(res.data);
    } catch (error) {
      console.error("Failed to fetch courses", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (categoryId) => {
    if (activeCategory === categoryId) {
      setActiveCategory("");
      fetchCourses("");
    } else {
      setActiveCategory(categoryId);
      fetchCourses(categoryId);
    }
  };

  return (
    <div className="courses-container">
      <div className="courses-header">
        <h1 className="courses-title">Khám Phá Các Khóa Học</h1>
        <p style={{ color: "#94a3b8", fontSize: "1.1rem" }}>
          Nâng cao kỹ năng lập trình của bạn với các khóa học chất lượng cao
        </p>
      </div>

      <div className="category-filters">
        <button
          className={`filter-btn ${activeCategory === "" ? "active" : ""}`}
          onClick={() => handleFilter("")}
        >
          Tất cả
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            className={`filter-btn ${activeCategory === cat._id ? "active" : ""}`}
            onClick={() => handleFilter(cat._id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
          Đang tải dữ liệu...
        </div>
      ) : (
        <div className="courses-grid">
          {courses.map((course) => (
            <Link to={`/courses/${course.slug}`} className="course-card" key={course._id}>
              <img src={course.image} alt={course.title} className="course-image" />
              <div className="course-content">
                <span className="course-badge">{course.category?.name || "Lập trình"}</span>
                <h3 className="course-card-title">{course.title}</h3>
                <p className="course-card-desc">{course.description}</p>
                <div className="course-footer">
                  <span className="course-price">
                    {course.price === 0 ? "Miễn phí" : `${course.price.toLocaleString("vi-VN")} đ`}
                  </span>
                  <span className="course-level">
                    {course.level}
                  </span>
                </div>
              </div>
            </Link>
          ))}
          {courses.length === 0 && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", color: "#64748b", padding: "40px" }}>
              Không có khóa học nào để hiển thị.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
