const express = require("express");
const router = express.Router();
const { getAllCourses, getCourseBySlug } = require("../controllers/course.controller");

router.get("/", getAllCourses);
router.get("/:slug", getCourseBySlug);

module.exports = router;
