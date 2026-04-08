// ================================================
// CONTROLLER: Course - Quản lý khóa học
// Mô tả: CRUD khóa học, tìm kiếm, lọc, đánh giá, wishlist
// ================================================
const Course = require("../models/Course");
const User = require("../models/User");
const Order = require("../models/Order");
const slugify = require("slugify");

// ================================================
// FEATURE 11: Lấy danh sách khóa học (Public)
// Input: Query params: category, level, search, sort, page, limit
// Output: Danh sách khóa học có phân trang, tìm kiếm, lọc
// ================================================
exports.getAllCourses = async (req, res) => {
  try {
    const {
      category,
      level,
      search,
      status,
      sort = "-createdAt",
      minPrice,
      maxPrice,
      featured,
      page = 1,
      limit = 12,
    } = req.query;

    // Public luon chi thay khoa da cong khai.
    // Admin/instructor co the yeu cau xem tat ca hoac loc theo trang thai.
    const canManageCourses =
      req.user?.role === "admin" || req.user?.role === "instructor";
    const filter = {};

    if (canManageCourses && status) {
      if (status !== "all") {
        filter.status = status;
      }
      // Nếu là giảng viên, chỉ lấy khóa học do chính họ tạo
      if (req.user.role === "instructor") {
        filter.instructor = req.user.id;
      }
    } else {
      filter.status = "published";
    }

    // Lọc theo danh mục
    if (category) filter.category = category;

    // Lọc theo cấp độ
    if (level) filter.level = level;

    // Lọc theo khóa học nổi bật
    if (featured === "true") filter.isFeatured = true;

    // Lọc theo khoảng giá
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Tìm kiếm theo tiêu đề, mô tả, tags (tìm kiếm text)
    if (search) {
      filter.$text = { $search: search };
    }

    // Cấu hình sắp xếp: price (thấp đến cao), -price (cao đến thấp),
    // -averageRating (nhiều sao nhất), enrolledCount (phổ biến nhất)
    let sortOption = {};
    switch (sort) {
      case "price":
        sortOption = { price: 1 };
        break;
      case "-price":
        sortOption = { price: -1 };
        break;
      case "-averageRating":
        sortOption = { averageRating: -1 };
        break;
      case "-enrolledCount":
        sortOption = { enrolledCount: -1 };
        break;
      case "-createdAt":
        sortOption = { createdAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    // Đếm tổng số khóa học (dùng cho pagination)
    const total = await Course.countDocuments(filter);

    // Lấy danh sách với populate category, instructor
    const courses = await Course.find(filter)
      .populate("category", "name slug color")
      .populate("instructor", "name avatar")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: courses.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: courses,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách khóa học:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// ================================================
// FEATURE 12: Lấy chi tiết 1 khóa học theo slug (Public)
// Input: slug từ URL params
// Output: Thông tin chi tiết khóa học kèm giảng viên, đánh giá
// ================================================
exports.getCourseBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // Tìm khóa học theo slug, lấy tất cả trạng thái, populate đầy đủ thông tin
    const course = await Course.findOne({ slug })
      .populate("category", "name slug description")
      .populate("instructor", "name avatar bio phone");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khóa học",
      });
    }

    // Kiểm tra quyền xem nếu khóa học chưa published
    if (course.status !== "published") {
      let canView = false;
      if (req.user) {
        if (req.user.role === "admin") {
          canView = true;
        } else if (req.user.role === "instructor" && course.instructor && course.instructor._id.toString() === req.user.id) {
          canView = true;
        }
      }

      if (!canView) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy khóa học",
        });
      }
    }

    res.json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error("Lỗi lấy chi tiết khóa học:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// ================================================
// FEATURE 13: Tạo khóa học mới (Admin / Instructor)
// Input: body chứa title, description, price, category...
// Output: Khóa học đã được tạo
// ================================================
exports.createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      discountPrice,
      category,
      level,
      image,
      language,
      prerequisites,
      whatYouLearn,
      tags,
      curriculum,
      status,
    } = req.body;

    // Tạo slug từ title (ví dụ: "ReactJS Cơ Bản" -> "reactjs-co-ban")
    const slug = slugify(title, {
      lower: true,
      strict: true,
      trim: true,
    });

    // Kiểm tra slug đã tồn tại chưa (thêm suffix nếu trùng)
    const existingSlug = await Course.findOne({ slug });
    const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

    // Tính tổng số bài học và thời lượng từ curriculum
    let totalLessons = 0;
    let totalDuration = 0;
    if (curriculum && curriculum.length > 0) {
      curriculum.forEach((section) => {
        if (section.lessons) {
          totalLessons += section.lessons.length;
          totalDuration += section.lessons.reduce(
            (sum, lesson) => sum + (lesson.duration || 0),
            0
          );
        }
      });
    }

    // Xác định instructor: nếu là admin thì có thể chỉ định instructor
    const instructorId =
      req.user.role === "admin" && req.body.instructor
        ? req.body.instructor
        : req.user.id;

    const authorName = req.user.role === "admin" && req.body.authorName
      ? req.body.authorName
      : (await User.findById(req.user.id))?.name || "Admin";

    // Tạo khóa học mới
    const course = await Course.create({
      title,
      slug: finalSlug,
      description,
      price,
      discountPrice: discountPrice || null,
      category,
      instructor: instructorId,
      authorName,
      level,
      image,
      language,
      prerequisites,
      whatYouLearn,
      tags,
      curriculum,
      totalLessons,
      totalDuration,
      status: req.user.role === "admin" ? (status || "draft") : "draft",
    });

    // Cập nhật số lượng khóa học trong category
    await updateCategoryCourseCount(category);

    res.status(201).json({
      success: true,
      message: "Tạo khóa học thành công",
      data: course,
    });
  } catch (error) {
    console.error("Lỗi tạo khóa học:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server: " + error.message,
    });
  }
};

// ================================================
// FEATURE 14: Cập nhật khóa học (Admin / Instructor)
// Input: courseId từ URL, data cập nhật từ body
// Output: Khóa học đã được cập nhật
// ================================================
exports.updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Tìm khóa học cần cập nhật
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khóa học",
      });
    }

    // Kiểm tra quyền: chỉ admin hoặc instructor sở hữu mới được sửa
    if (
      req.user.role !== "admin" &&
      course.instructor?.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền cập nhật khóa học này",
      });
    }

    // Nếu cập nhật title thì cập nhật slug luôn
    if (req.body.title && req.body.title !== course.title) {
      const newSlug = slugify(req.body.title, {
        lower: true,
        strict: true,
        trim: true,
      });
      req.body.slug = newSlug;
    }

    // Tính lại tổng bài học và thời lượng nếu có curriculum mới
    if (req.body.curriculum) {
      let totalLessons = 0;
      let totalDuration = 0;
      req.body.curriculum.forEach((section) => {
        if (section.lessons) {
          totalLessons += section.lessons.length;
          totalDuration += section.lessons.reduce(
            (sum, lesson) => sum + (lesson.duration || 0),
            0
          );
        }
      });
      req.body.totalLessons = totalLessons;
      req.body.totalDuration = totalDuration;
    }

    // Cập nhật khóa học với new: true để trả về document sau update
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      req.body,
      { new: true, runValidators: true }
    ).populate("category", "name slug");

    res.json({
      success: true,
      message: "Cập nhật khóa học thành công",
      data: updatedCourse,
    });
  } catch (error) {
    console.error("Lỗi cập nhật khóa học:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// ================================================
// FEATURE 15: Xóa khóa học (Admin)
// Input: courseId từ URL
// Output: Thông báo xóa thành công
// ================================================
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Khóa học không tồn tại",
      });
    }

    // Xóa khóa học
    await Course.findByIdAndDelete(courseId);

    // Cập nhật số lượng khóa học trong category
    await updateCategoryCourseCount(course.category);

    // Xóa khóa học khỏi wishlist của tất cả user
    await User.updateMany(
      { wishlist: courseId },
      { $pull: { wishlist: courseId } }
    );

    res.json({
      success: true,
      message: "Xóa khóa học thành công",
    });
  } catch (error) {
    console.error("Lỗi xóa khóa học:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// ================================================
// FEATURE 16: Thêm đánh giá khóa học (User đã mua)
// Input: courseId, rating (1-5), comment
// Output: Khóa học đã được thêm đánh giá, cập nhật averageRating
// ================================================
exports.addReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { rating, comment } = req.body;

    // Validate rating (1-5 sao)
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Số sao đánh giá phải từ 1 đến 5",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khóa học",
      });
    }

    // Kiểm tra user đã mua khóa học chưa (đã đăng ký)
    const user = await User.findById(req.user.id);
    const isEnrolled = user.enrolledCourses.includes(courseId);

    if (!isEnrolled && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Bạn cần đăng ký khóa học trước khi đánh giá",
      });
    }

    // Kiểm tra user đã đánh giá chưa (mỗi user chỉ đánh giá 1 lần)
    const existingReview = course.reviews.find(
      (r) => r.user.toString() === req.user.id
    );
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "Bạn đã đánh giá khóa học này rồi",
      });
    }

    // Thêm đánh giá mới vào mảng reviews
    course.reviews.push({
      user: req.user.id,
      rating,
      comment: comment || "",
      createdAt: new Date(),
    });

    // Tính lại averageRating và totalReviews
    const totalRating = course.reviews.reduce(
      (sum, r) => sum + r.rating,
      0
    );
    course.averageRating = parseFloat(
      (totalRating / course.reviews.length).toFixed(1)
    );
    course.totalReviews = course.reviews.length;

    await course.save();

    res.json({
      success: true,
      message: "Đánh giá thành công",
      data: {
        averageRating: course.averageRating,
        totalReviews: course.totalReviews,
      },
    });
  } catch (error) {
    console.error("Lỗi thêm đánh giá:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// ================================================
// FEATURE 17: Thêm/Xóa khóa học vào Wishlist (User)
// Input: courseId từ URL, action = 'add' hoặc 'remove'
// Output: Thông báo cập nhật wishlist thành công
// ================================================
exports.toggleWishlist = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { action } = req.query; // action = 'add' | 'remove'

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khóa học",
      });
    }

    const user = await User.findById(req.user.id);
    const isInWishlist = user.wishlist.includes(courseId);

    if (action === "remove" || (action !== "add" && isInWishlist)) {
      // Xóa khỏi wishlist
      user.wishlist.pull(courseId);
      await user.save();
      return res.json({
        success: true,
        message: "Đã xóa khỏi danh sách yêu thích",
        isWishlisted: false,
      });
    } else {
      // Thêm vào wishlist (nếu chưa có)
      if (!isInWishlist) {
        user.wishlist.push(courseId);
        await user.save();
      }
      return res.json({
        success: true,
        message: "Đã thêm vào danh sách yêu thích",
        isWishlisted: true,
      });
    }
  } catch (error) {
    console.error("Lỗi toggle wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// ================================================
// FEATURE 18: Lấy thống kê Dashboard (Admin)
// Output: Tổng số khóa học, học viên, doanh thu, khóa phổ biến
// ================================================
exports.getDashboardStats = async (req, res) => {
  try {
    // Tổng số khóa học
    const totalCourses = await Course.countDocuments({ status: "published" });

    // Tổng số học viên
    const totalStudents = await User.countDocuments({ role: "user" });

    // Tổng số giảng viên
    const totalInstructors = await User.countDocuments({ role: "instructor" });

    // Tổng doanh thu (chỉ tính đơn đã thanh toán thành công)
    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Doanh thu tháng này
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const monthlyRevenueResult = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: { $gte: startOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const monthlyRevenue = monthlyRevenueResult[0]?.total || 0;

    // Khóa học phổ biến nhất (nhiều học viên nhất)
    const popularCourses = await Course.find({ status: "published" })
      .sort({ enrolledCount: -1 })
      .limit(5)
      .populate("category", "name");

    // Khóa học có đánh giá cao nhất
    const topRatedCourses = await Course.find({ status: "published", totalReviews: { $gt: 0 } })
      .sort({ averageRating: -1 })
      .limit(5)
      .populate("category", "name");

    // Đơn hàng gần đây
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email")
      .populate("items.course", "title");

    // Số đơn hàng theo trạng thái
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: "$paymentStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        totalCourses,
        totalStudents,
        totalInstructors,
        totalRevenue,
        monthlyRevenue,
        popularCourses,
        topRatedCourses,
        recentOrders,
        orderStats,
      },
    });
  } catch (error) {
    console.error("Lỗi lấy thống kê dashboard:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// ================================================
// FEATURE 19: Lấy khóa học của Instructor hiện tại
// Output: Danh sách khóa học do instructor tạo
// ================================================
exports.getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id })
      .populate("category", "name slug")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    console.error("Lỗi lấy khóa học của instructor:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// ================================================
// FEATURE 20: Lấy khóa học đã đăng ký của User
// Output: Danh sách khóa học trong enrolledCourses
// ================================================
exports.getMyEnrolledCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "enrolledCourses",
      populate: { path: "category", select: "name slug" },
    });

    res.json({
      success: true,
      count: user.enrolledCourses.length,
      data: user.enrolledCourses,
    });
  } catch (error) {
    console.error("Lỗi lấy khóa học đã đăng ký:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// ================================================
// HELPER: Cập nhật số lượng khóa học trong category
// ================================================
async function updateCategoryCourseCount(categoryId) {
  if (!categoryId) return;
  const Category = require("../models/Category");
  const count = await Course.countDocuments({
    category: categoryId,
    status: "published",
  });
  await Category.findByIdAndUpdate(categoryId, { courseCount: count });
}

