// ================================================
// CONTROLLER: Coupon - Quản lý mã giảm giá (Admin)
// Mô tả: CRUD coupon cho chiến dịch khuyến mãi
// ================================================
const Coupon = require("../models/Coupon");
const Order = require("../models/Order");

// ================================================
// Tạo coupon mới (Admin)
// ================================================
exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      name,
      discountType,
      discountValue,
      maxDiscountAmount,
      usageLimit,
      maxUsagePerUser,
      startDate,
      endDate,
      applicableCourses,
      applicableCategories,
    } = req.body;

    // Validate discountValue
    if (discountType === "percent" && (discountValue < 1 || discountValue > 100)) {
      return res.status(400).json({
        success: false,
        message: "Phần trăm giảm phải từ 1 đến 100",
      });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      name,
      discountType,
      discountValue,
      maxDiscountAmount,
      usageLimit: usageLimit || null,
      maxUsagePerUser: maxUsagePerUser || 1,
      startDate: startDate || Date.now(),
      endDate,
      applicableCourses: applicableCourses || [],
      applicableCategories: applicableCategories || [],
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Tạo mã giảm giá thành công",
      data: coupon,
    });
  } catch (error) {
    console.error("Lỗi tạo coupon:", error);
    res.status(500).json({
      success: false,
      message: error.code === 11000 ? "Mã giảm giá đã tồn tại" : "Lỗi server",
    });
  }
};

// ================================================
// Lấy danh sách coupon (Admin)
// ================================================
exports.getAllCoupons = async (req, res) => {
  try {
    const { page = 1, limit = 20, isActive } = req.query;

    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const total = await Coupon.countDocuments(filter);

    const coupons = await Coupon.find(filter)
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: coupons,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Lỗi lấy coupons:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// ================================================
// Cập nhật coupon (Admin)
// ================================================
exports.updateCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;

    const coupon = await Coupon.findByIdAndUpdate(
      couponId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Không tìm thấy coupon" });
    }

    res.json({ success: true, message: "Cập nhật thành công", data: coupon });
  } catch (error) {
    console.error("Lỗi cập nhật coupon:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// ================================================
// Xóa coupon (Admin)
// ================================================
exports.deleteCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;
    await Coupon.findByIdAndDelete(couponId);
    res.json({ success: true, message: "Xóa mã giảm giá thành công" });
  } catch (error) {
    console.error("Lỗi xóa coupon:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
