// ================================================
// PAGE: Checkout - Trang thanh toán
// Mô tả: Hiển thị giỏ hàng, nhập mã giảm giá, chọn phương thức thanh toán
// FEATURE 25: Tạo đơn hàng
// ================================================
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createOrder, applyCoupon } from "../services/orderService";
import Icon from "../components/Icon";
import "../styles/checkout.css";

export default function Checkout() {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [paymentMethod, setPaymentMethod] = useState("vnpay");

  // ================================================
  // Mount: lấy giỏ hàng từ localStorage
  // ================================================
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) setCart(parsed);
      } catch {
        setCart([]);
      }
    }
  }, []);

  // Tính tổng tiền
  const subtotal = Array.isArray(cart) ? cart.reduce((sum, item) => sum + (item.discountPrice || item.price), 0) : 0;
  const discountAmount = couponDiscount || 0;
  const total = Math.max(0, subtotal - discountAmount);

  // ================================================
  // Áp dụng mã giảm giá
  // ================================================
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Vui lòng nhập mã giảm giá");
      return;
    }

    setCouponError("");
    try {
      const courseIds = cart.map((item) => item._id || item.courseId);
      const res = await applyCoupon({ code: couponCode, courseIds });

      if (res.data.success) {
        const coupon = res.data.data;
        let discount = 0;
        if (coupon.discountType === "percent") {
          discount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
            discount = coupon.maxDiscountAmount;
          }
        } else {
          discount = coupon.discountValue;
        }
        setCouponDiscount(discount);
        setMessage({
          type: "success",
          text: `Áp dụng mã "${coupon.code}" thành công! Giảm ${coupon.discountType === "percent" ? `${coupon.discountValue}%` : `${coupon.discountValue.toLocaleString("vi-VN")}đ`}`,
        });
      }
    } catch (err) {
      setCouponError(err.response?.data?.message || "Mã giảm giá không hợp lệ");
      setCouponDiscount(null);
    }
  };

  // ================================================
  // Xóa mã giảm giá
  // ================================================
  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponDiscount(null);
    setCouponError("");
    setMessage({ type: "", text: "" });
  };

  // ================================================
  // Xóa khóa học khỏi giỏ hàng
  // ================================================
  const handleRemoveItem = (courseId) => {
    if (!Array.isArray(cart)) return;
    const newCart = cart.filter((item) => (item._id || item.courseId) !== courseId);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  // ================================================
  // FEATURE 25: Tạo đơn hàng
  // ================================================
  const handlePlaceOrder = async () => {
    if (!Array.isArray(cart) || cart.length === 0) {
      setMessage({ type: "error", text: "Giỏ hàng trống!" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const orderData = {
        items: cart.map((item) => ({
          courseId: item._id || item.courseId,
          price: item.discountPrice || item.price,
        })),
        couponCode: couponDiscount ? couponCode : null,
        paymentMethod,
      };

      const res = await createOrder(orderData);

      if (res.data.success) {
        // Nếu có paymentUrl (VNPay/MoMo) -> Chuyển hướng
        if (res.data.data.paymentUrl) {
          window.location.href = res.data.data.paymentUrl;
          return;
        }

        localStorage.removeItem("cart");
        setCart([]);
        setMessage({ type: "success", text: "Đặt hàng thành công! Đang chuyển đến khóa học..." });
        setTimeout(() => navigate("/my-learning"), 2000);
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Đặt hàng thất bại. Vui lòng thử lại." });
    } finally {
      setLoading(false);
    }
  };

  // ================================================
  // RENDER: Giỏ hàng trống
  // ================================================
  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty">
          <h2 style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
            <Icon name="cart" size={18} /> Giỏ hàng trống
          </h2>
          <p>Bạn chưa chọn khóa học nào để thanh toán.</p>
          <Link to="/courses" className="btn btn-primary">
            Khám phá khóa học
          </Link>
        </div>
      </div>
    );
  }

  // ================================================
  // RENDER: Giao diện thanh toán
  // ================================================
  return (
    <div className="checkout-page">
      <div className="checkout-container">
        {/* ===== LEFT: DANH SÁCH KHÓA HỌC ===== */}
        <div className="checkout-items">
          <h2 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Icon name="cart" size={18} /> Thanh toán
          </h2>
          {message.text && (
            <div className={`message-box ${message.type}`}>{message.text}</div>
          )}

          {cart.map((item) => (
            <div key={item._id || item.courseId} className="checkout-item">
              <img
                src={item.image}
                alt={item.title}
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&q=80";
                }}
              />
              <div className="checkout-item-info">
                <h3>{item.title}</h3>
                <p className="item-instructor">{item.authorName}</p>
                <div className="item-price">
                  {item.discountPrice ? (
                    <>
                      <span className="original-price">{item.price.toLocaleString("vi-VN")}đ</span>
                      <span className="sale-price">{item.discountPrice.toLocaleString("vi-VN")}đ</span>
                    </>
                  ) : (
                    <span className={`sale-price ${item.price === 0 ? "free" : ""}`}>
                      {item.price === 0 ? "Miễn phí" : `${item.price.toLocaleString("vi-VN")}đ`}
                    </span>
                  )}
                </div>
              </div>
              <button className="btn-remove" onClick={() => handleRemoveItem(item._id || item.courseId)} aria-label="Xóa khỏi giỏ">
                <Icon name="trash" size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* ===== RIGHT: TÓM TẮT THANH TOÁN ===== */}
        <div className="checkout-summary">
          <h3>Tóm tắt đơn hàng</h3>

          {/* Mã giảm giá */}
          <div className="coupon-section">
            {couponDiscount ? (
              <div className="coupon-applied">
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                  <Icon name="checkCircle" size={16} /> Mã "{couponCode}" đã áp dụng
                </span>
                <button onClick={handleRemoveCoupon} className="btn-remove-coupon" aria-label="Xóa mã giảm giá">X</button>
              </div>
            ) : (
              <div className="coupon-input-group">
                <input
                  type="text"
                  placeholder="Nhập mã giảm giá"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                />
                <button onClick={handleApplyCoupon} className="btn btn-outline btn-sm">
                  Áp dụng
                </button>
              </div>
            )}
            {couponError && <p className="coupon-error">{couponError}</p>}
          </div>

          {/* Chi tiết giá */}
          <div className="summary-rows">
            <div className="summary-row">
              <span>Tạm tính</span>
              <span>{subtotal.toLocaleString("vi-VN")}đ</span>
            </div>
            {discountAmount > 0 && (
              <div className="summary-row discount">
                <span>Giảm giá</span>
                <span>-{discountAmount.toLocaleString("vi-VN")}đ</span>
              </div>
            )}
            <div className="summary-row total">
              <span>Tổng cộng</span>
              <span>{total.toLocaleString("vi-VN")}đ</span>
            </div>
          </div>

          {/* Phương thức thanh toán */}
          <div className="payment-methods">
            <h4>Phương thức thanh toán</h4>
            {[
              { value: "vnpay", label: "Ví điện tử VNPay (Thẻ ATM, QR Code, Thẻ quốc tế)" },
            ].map((opt) => (
              <label
                key={opt.value}
                className={`payment-option ${paymentMethod === opt.value ? "active" : ""}`}
              >
                <input
                  type="radio"
                  name="payment"
                  value={opt.value}
                  checked={paymentMethod === opt.value}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                {opt.label}
              </label>
            ))}
          </div>

          {/* Nút đặt hàng */}
          <button
            className="btn btn-primary enroll-btn"
            onClick={handlePlaceOrder}
            disabled={loading}
            style={{ width: "100%", padding: "14px", fontSize: "1rem" }}
          >
            {loading ? "Đang xử lý..." : `Đặt hàng ngay (${total.toLocaleString("vi-VN")}đ)`}
          </button>

          <p className="guarantee" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Icon name="lock" size={16} /> Thanh toán an toàn · Đảm bảo hoàn tiền trong 30 ngày.
          </p>
        </div>
      </div>
    </div>
  );
}