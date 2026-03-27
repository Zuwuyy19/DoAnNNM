const Course = require("../models/Course");

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const { category } = req.query;
    
    // Build query
    let query = {};
    if (category) {
      query.category = category;
    }

    const courses = await Course.find(query).populate("category", "name slug").sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get single course by slug
exports.getCourseBySlug = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug }).populate("category", "name slug");
    
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    res.status(200).json({ success: true, data: course });
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
