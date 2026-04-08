// ================================================
// CONTROLLER: Order - Quản lý đơn hàng
// Mô tả: Tạo đơn hàng, xử lý thanh toán, xem lịch sử mua hàng
// ================================================
const Order = require("../models/Order");
const Course = require("../models/Course");
const User = require("../models/User");
const Coupon = require("../models/Coupon");

// ================================================
// FEATURE 25: Tạo đơn hàng mới (User)
// Input: items (mảng {courseId, price}), couponCode, paymentMethod
// Output: Order đã tạo, kèm thông tin thanh toán
// ================================================
exports.createOrder = async (req, res) => {
  try {
    const { items, couponCode, paymentMethod } = req.body;

    // Validate: cần có ít nhất 1 khóa học trong đơn
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Đơn hàng phải có ít nhất 1 khóa học",
      });
    }

    // Lấy thông tin user hiện tại
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // Xử lý từng item: lấy thông tin khóa học và tính giá
    let orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const course = await Course.findById(item.courseId || item.course);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy khóa học: ${item.courseId || item.course}`,
        });
      }

      // Kiểm tra user đã đăng ký khóa học này chưa
      if (user.enrolledCourses.includes(course._id)) {
        return res.status(400).json({
          success: false,
          message: `Bạn đã đăng ký khóa học "${course.title}" rồi`,
        });
      }

      // Dùng giá đang hiển thị (discountPrice nếu có, không thì dùng price)
      const priceAtPurchase = course.discountPrice || course.price;

      orderItems.push({
        course: course._id,
        priceAtPurchase,
      });
      totalAmount += priceAtPurchase;
    }

    // Xử lý mã giảm giá (Coupon)
    let discountAmount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
      });

      if (!coupon) {
        return res.status(400).json({
          success: false,
          message: "Mã giảm giá không hợp lệ hoặc đã hết hạn",
        });
      }

      // Kiểm tra thời hạn
      if (new Date() > new Date(coupon.endDate)) {
        return res.status(400).json({
          success: false,
          message: "Mã giảm giá đã hết hạn",
        });
      }

      // Kiểm tra số lượng sử dụng
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({
          success: false,
          message: "Mã giảm giá đã hết lượt sử dụng",
        });
      }

      // Kiểm tra coupon có áp dụng cho khóa học này không
      const courseIds = orderItems.map((i) => i.course.toString());
      const isApplicable =
        (!coupon.applicableCourses || coupon.applicableCourses.length === 0) &&
        (!coupon.applicableCategories || coupon.applicableCategories.length === 0);

      if (!isApplicable) {
        const hasValidCourse = courseIds.some((cid) =>
          coupon.applicableCourses?.map((c) => c.toString()).includes(cid)
        );
        if (!hasValidCourse) {
          return res.status(400).json({
            success: false,
            message: "Mã giảm giá không áp dụng cho khóa học này",
          });
        }
      }

      // Tính số tiền được giảm
      if (coupon.discountType === "percent") {
        discountAmount = (totalAmount * coupon.discountValue) / 100;
        // Giới hạn số tiền giảm tối đa (nếu có)
        if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
          discountAmount = coupon.maxDiscountAmount;
        }
      } else {
        // Giảm số tiền cố định
        discountAmount = coupon.discountValue;
        if (discountAmount > totalAmount) {
          discountAmount = totalAmount; // Không giảm quá tổng tiền
        }
      }

      appliedCoupon = coupon;
    }

    // Tính số tiền cuối cùng phải trả
    const finalAmount = Math.max(0, totalAmount - discountAmount);

    // Tạo đơn hàng mới
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount: finalAmount,
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      discountAmount,
      paymentMethod: paymentMethod || "cod",
      buyerEmail: user.email,
    });

    // Nếu là thanh toán ngay (VNPay/MoMo), trả về URL thanh toán
    if (paymentMethod === "vnpay" || paymentMethod === "momo") {
      // Trong thực tế: gọi API VNPay/MoMo để tạo payment URL
      // Ví dụ: const paymentUrl = await createVNPayPayment(order);
      order.transactionId = `PAY-${Date.now()}`;
      await order.save();

      return res.status(201).json({
        success: true,
        message: "Tạo đơn hàng thành công. Vui lòng hoàn tất thanh toán.",
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          totalAmount: finalAmount,
          paymentMethod,
          // DEV: paymentUrl sẽ được tạo từ cổng thanh toán thực
          paymentUrl: `https://sandbox.vnpay.vn/payment?order=${order.orderNumber}`,
        },
      });
    }

    // Nếu là COD: xử lý đăng ký khóa học ngay
    if (paymentMethod === "cod") {
      // Cập nhật paymentStatus = paid và orderStatus = completed
      order.paymentStatus = "paid";
      order.orderStatus = "completed";
      await order.save();

      // Thêm khóa học vào danh sách enrolledCourses của user
      for (const item of orderItems) {
        user.enrolledCourses.push(item.course);

        // Tăng số lượng học viên trong khóa học
        await Course.findByIdAndUpdate(item.course, {
          $inc: { enrolledCount: 1 },
        });
      }

      // Tăng số lần sử dụng coupon
      if (appliedCoupon) {
        appliedCoupon.usedCount += 1;
        await appliedCoupon.save();
      }

      await user.save();
    }

    res.status(201).json({
      success: true,
      message: "Tạo đơn hàng thành công",
      data: order,
    });
  } catch (error) {
    console.error("Lỗi tạo đơn hàng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server: " + error.message,
    });
  }
};

// ================================================
// Lấy danh sách đơn hàng của User
// ================================================
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("items.course", "title slug image")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Lỗi lấy đơn hàng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// ================================================
// Lấy chi tiết đơn hàng theo ID
// ================================================
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("user", "name email")
      .populate("items.course", "title slug image");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    // Chỉ user sở hữu hoặc admin mới xem được
    if (order.user._id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xem đơn hàng này",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Lỗi lấy chi tiết đơn hàng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// ================================================
// Lấy tất cả đơn hàng (Admin)
// ================================================
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, paymentStatus } = req.query;

    const filter = {};
    if (status) filter.orderStatus = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const total = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .populate("user", "name email")
      .populate("items.course", "title")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Lỗi lấy tất cả đơn hàng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// ================================================
// Cập nhật trạng thái đơn hàng (Admin)
// ================================================
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    // Cập nhật trạng thái
    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    // Nếu thanh toán thành công -> cấp quyền học
    if (paymentStatus === "paid" && order.paymentStatus !== "paid") {
      const user = await User.findById(order.user);
      for (const item of order.items) {
        if (!user.enrolledCourses.includes(item.course)) {
          user.enrolledCourses.push(item.course);
          await Course.findByIdAndUpdate(item.course, {
            $inc: { enrolledCount: 1 },
          });
        }
      }
      await user.save();
    }

    await order.save();

    res.json({
      success: true,
      message: "Cập nhật đơn hàng thành công",
      data: order,
    });
  } catch (error) {
    console.error("Lỗi cập nhật đơn hàng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// ================================================
// Áp dụng mã giảm giá (kiểm tra trước khi tạo đơn)
// ================================================
exports.applyCoupon = async (req, res) => {
  try {
    const { code, courseIds } = req.body;

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: "Mã giảm giá không tồn tại",
      });
    }

    if (new Date() > new Date(coupon.endDate)) {
      return res.status(400).json({
        success: false,
        message: "Mã giảm giá đã hết hạn",
      });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "Mã giảm giá đã hết lượt sử dụng",
      });
    }

    res.json({
      success: true,
      data: {
        code: coupon.code,
        name: coupon.name,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscountAmount: coupon.maxDiscountAmount,
      },
    });
  } catch (error) {
    console.error("Lỗi áp dụng coupon:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};