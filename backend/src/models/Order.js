// ================================================
// MODEL: Order - Đơn hàng / Giao dịch
// Mô tả: Lưu trữ thông tin đơn mua khóa học của học viên
// ================================================
const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    // Khóa học được mua (ObjectId reference Course)
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    // Giá tại thời điểm mua (để tính toán chính xác)
    priceAtPurchase: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    // Người mua (ObjectId reference User)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Danh sách khóa học trong đơn
    items: [orderItemSchema],
    // Tổng tiền đơn hàng (VNĐ)
    totalAmount: {
      type: Number,
      required: true,
    },
    // Mã giảm giá đã áp dụng (nếu có)
    couponCode: {
      type: String,
      default: null,
    },
    // Số tiền được giảm từ mã giảm giá
    discountAmount: {
      type: Number,
      default: 0,
    },
    // Phương thức thanh toán: 'vnpay' | 'momo' | 'banking' | 'cod'
    paymentMethod: {
      type: String,
      enum: ["vnpay", "momo", "banking", "cod"],
      default: "cod",
    },
    // Trạng thái thanh toán: 'pending' | 'paid' | 'failed' | 'refunded'
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    // Mã giao dịch từ cổng thanh toán (VNPay/MoMo)
    transactionId: {
      type: String,
      default: null,
    },
    // Trạng thái đơn hàng: 'processing' | 'completed' | 'cancelled'
    orderStatus: {
      type: String,
      enum: ["processing", "completed", "cancelled"],
      default: "processing",
    },
    // Mã đơn hàng tự tăng
    orderNumber: {
      type: String,
      unique: true,
    },
    // Email người mua (lưu trữ để gửi email xác nhận)
    buyerEmail: {
      type: String,
      required: true,
    },
    // Ghi chú đơn hàng
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// ================================================
// MIDDLEWARE: Tạo mã đơn hàng tự động trước khi lưu
// Mongoose 9: dùng async/await, KHÔNG gọi next()
// ================================================
OrderSchema.pre("save", async function () {
  if (!this.orderNumber) {
    // Format: DM-YYYYMMDD-XXXX (số ngẫu nhiên 4 chữ số)
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const random = Math.floor(1000 + Math.random() * 9000);
    this.orderNumber = `DM-${date}-${random}`;
  }
});

// ================================================
// INDEX: Tối ưu truy vấn
// ================================================
OrderSchema.index({ user: 1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Order", OrderSchema);
