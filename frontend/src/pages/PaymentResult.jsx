import { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Icon from "../components/Icon";

export default function PaymentResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [orderDetails, setOrderDetails] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    verifyPayment();
  }, [location.search]);

  const verifyPayment = async () => {
    try {
      // VNPay trả kết quả qua query params
      // Gửi toàn bộ query params sang backend để verify chữ ký
      const res = await api.get(`/orders/vnpay-return${location.search}`);

      if (res.data.success) {
        setStatus("success");
        setOrderDetails(res.data.data);
        // Xóa giỏ hàng nếu thanh toán thành công (phòng trường hợp Checkout chưa xóa)
        localStorage.removeItem("cart");
      } else {
        setStatus("error");
        setErrorMsg(res.data.message || "Thanh toán không thành công");
      }
    } catch (err) {
      console.error("Lỗi xác thực thanh toán:", err);
      setStatus("error");
      setErrorMsg(err.response?.data?.message || "Có lỗi xảy ra khi xác thực giao dịch");
    }
  };

  return (
    <div style={{ padding: "80px 20px", textAlign: "center", minHeight: "70vh", background: "#f8fafc" }}>
      <div style={{ maxWidth: "500px", margin: "0 auto", background: "white", padding: "40px", borderRadius: "16px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}>
        
        {status === "loading" && (
          <>
            <div className="spinner spinner-large" style={{ margin: "0 auto 20px" }}></div>
            <h2>Đang xác thực giao dịch...</h2>
            <p style={{ color: "#64748b" }}>Vui lòng không tắt trình duyệt hoặc tải lại trang.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div style={{ color: "#10b981", marginBottom: "20px" }}>
              <Icon name="checkCircle" size={64} />
            </div>
            <h2 style={{ fontSize: "1.8rem", color: "#0f172a", marginBottom: "12px" }}>Thanh toán thành công!</h2>
            <p style={{ color: "#64748b", marginBottom: "24px", lineHeight: "1.6" }}>
              Cảm ơn bạn đã tin tưởng DevMaster. Khóa học của bạn đã được mở khóa và sẵn sàng để học ngay bây giờ.
            </p>
            {orderDetails && (
              <div style={{ background: "#f1f5f9", padding: "16px", borderRadius: "8px", marginBottom: "24px", textAlign: "left", fontSize: "0.9rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ color: "#64748b" }}>Mã đơn hàng:</span>
                  <span style={{ fontWeight: "600" }}>#{orderDetails.orderNumber}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748b" }}>Trạng thái:</span>
                  <span style={{ color: "#10b981", fontWeight: "600" }}>Đã thanh toán</span>
                </div>
              </div>
            )}
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <Link to="/my-learning" className="btn btn-primary" style={{ padding: "12px 24px" }}>
                Vào học ngay
              </Link>
              <Link to="/" className="btn btn-outline" style={{ padding: "12px 24px" }}>
                Trang chủ
              </Link>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div style={{ color: "#ef4444", marginBottom: "20px" }}>
              <Icon name="lock" size={64} />
            </div>
            <h2 style={{ fontSize: "1.8rem", color: "#0f172a", marginBottom: "12px" }}>Thanh toán thất bại</h2>
            <p style={{ color: "#64748b", marginBottom: "24px", lineHeight: "1.6" }}>
              Rất tiếc, giao dịch không thể hoàn tất. {errorMsg}
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button onClick={() => navigate("/checkout")} className="btn btn-primary" style={{ padding: "12px 24px" }}>
                Thử lại
              </button>
              <Link to="/" className="btn btn-outline" style={{ padding: "12px 24px" }}>
                Về trang chủ
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
