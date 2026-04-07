// ================================================
// CONTROLLER: Category - Quản lý danh mục
// Mô tả: CRUD danh mục khóa học (Admin)
// ================================================
const Category = require("../models/Category");
const Course = require("../models/Course");
const slugify = require("slugify");

// ================================================
// FEATURE 21: Lấy danh sách danh mục (Public)
// Input: Query params: parent (lọc danh mục con), search
// Output: Danh sách danh mục active, kèm số khóa học
// ================================================
exports.getAllCategories = async (req, res) => {
  try {
    const { parent, search } = req.query;

    // Xây dựng filter
    const filter = { isActive: true };
    if (parent === "null") filter.parent = null;
    if (parent) filter.parent = parent;
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    // Lấy danh sách sắp xếp theo thứ tự order
    const categories = await Category.find(filter)
      .populate("parent", "name slug")
      .sort({ order: 1, name: 1 });

    // Tính số lượng khóa học thực tế cho mỗi danh mục
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Course.countDocuments({
          category: cat._id,
          status: "published",
        });
        return {
          ...cat.toObject(),
          courseCount: count,
        };
      })
    );

    res.json({
      success: true,
      count: categoriesWithCount.length,
      data: categoriesWithCount,
    });
  } catch (error) {
    console.error("Lỗi lấy danh mục:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// ================================================
// FEATURE 22: Tạo danh mục mới (Admin)
// Input: name, description, icon, color, order, parent
// Output: Danh mục đã được tạo
// ================================================
exports.createCategory = async (req, res) => {
  try {
    const { name, description, icon, color, order, parent } = req.body;

    // Tạo slug từ name
    const slug = slugify(name, {
      lower: true,
      strict: true,
      trim: true,
    });

    // Kiểm tra name và slug đã tồn tại chưa
    const existCategory = await Category.findOne({
      $or: [{ name }, { slug }],
    });
    if (existCategory) {
      return res.status(400).json({
        success: false,
        message: "Tên danh mục hoặc slug đã tồn tại",
      });
    }

    // Nếu có parent, kiểm tra parent tồn tại
    if (parent) {
      const parentCat = await Category.findById(parent);
      if (!parentCat) {
        return res.status(400).json({
          success: false,
          message: "Danh mục cha không tồn tại",
        });
      }
    }

    const category = await Category.create({
      name,
      slug,
      description,
      icon,
      color,
      order: order || 0,
      parent: parent || null,
    });

    res.status(201).json({
      success: true,
      message: "Tạo danh mục thành công",
      data: category,
    });
  } catch (error) {
    console.error("Lỗi tạo danh mục:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// ================================================
// FEATURE 23: Cập nhật danh mục (Admin)
// Input: categoryId từ URL, data cập nhật từ body
// Output: Danh mục đã được cập nhật
// ================================================
exports.updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Nếu cập nhật name thì cập nhật slug luôn
    if (req.body.name) {
      req.body.slug = slugify(req.body.name, {
        lower: true,
        strict: true,
        trim: true,
      });
    }

    const category = await Category.findByIdAndUpdate(
      categoryId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục",
      });
    }

    res.json({
      success: true,
      message: "Cập nhật danh mục thành công",
      data: category,
    });
  } catch (error) {
    console.error("Lỗi cập nhật danh mục:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// ================================================
// FEATURE 24: Xóa danh mục (Admin)
// Input: categoryId từ URL
// Output: Thông báo xóa thành công
// ================================================
exports.deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Kiểm tra có khóa học nào đang dùng danh mục này không
    const courseCount = await Course.countDocuments({ category: categoryId });
    if (courseCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Danh mục đang có ${courseCount} khóa học. Không thể xóa.`,
      });
    }

    // Kiểm tra có danh mục con không
    const childCount = await Category.countDocuments({ parent: categoryId });
    if (childCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Danh mục đang có ${childCount} danh mục con. Xóa danh mục con trước.`,
      });
    }

    await Category.findByIdAndDelete(categoryId);

    res.json({
      success: true,
      message: "Xóa danh mục thành công",
    });
  } catch (error) {
    console.error("Lỗi xóa danh mục:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// ================================================
// Lấy 1 danh mục theo slug (Public)
// ================================================
exports.getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ slug, isActive: true })
      .populate("parent", "name slug");

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục",
      });
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Lỗi lấy danh mục:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};
