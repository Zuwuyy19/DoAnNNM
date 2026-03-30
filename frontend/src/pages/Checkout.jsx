import { createOrder } from "../services/orderService";

const Checkout = () => {
  const handleCheckout = async () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    try {
      await createOrder({ items: cart });
      alert("Đặt hàng thành công!");
      localStorage.removeItem("cart");
    } catch (err) {
      alert("Lỗi đặt hàng");
    }
  };

  return (
    <div>
      <h2>Checkout</h2>
      <button onClick={handleCheckout}>
        Thanh toán
      </button>
    </div>
  );
};

export default Checkout;