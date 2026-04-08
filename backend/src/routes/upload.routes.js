const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/upload.controller");
const { verifyToken, requireInstructor } = require("../middlewares/auth.middleware");

// Route API: POST /api/upload
// Chỉ có admin hoặc giảng viên (teacher/instructor) được phép upload file
router.post("/", verifyToken, requireInstructor, uploadController.uploadFile);

module.exports = router;
