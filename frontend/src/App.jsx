// ================================================
// APP.JSX - Component chính của ứng dụng React
// Mô tả: Định tuyến chính (routing), bảo vệ route,
//        Navbar dùng chung cho MỌI TRANG (kể cả Home)
// ================================================
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

// ===== PAGES =====
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CourseList from "./pages/course/CourseList";
import CourseDetail from "./pages/course/CourseDetail";
import Learning from "./pages/course/Learning";
import Profile from "./pages/Profile";
import Checkout from "./pages/Checkout";
import MyLearning from "./pages/MyLearning";
import Wishlist from "./pages/Wishlist";
import MyOrders from "./pages/MyOrders";

// ===== ADMIN PAGES =====
import AdminDashboard from "./pages/admin/Dashboard";
import AdminCourses from "./pages/admin/Courses";
import AdminCategories from "./pages/admin/Categories";
import AdminUsers from "./pages/admin/Users";
import AdminOrders from "./pages/admin/Orders";
import AdminCoupons from "./pages/admin/Coupons";

// ===== COMPONENTS =====
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// ================================================
// COMPONENT: ScrollToTop - Cuộn lên đầu khi chuyển trang
// ================================================
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
}

// ================================================
// COMPONENT: AppContent - Nội dung có Navbar + animation
// ================================================
function AppContent() {
  const location = useLocation();

  return (
    <>
      <ScrollToTop />

      {/* Navbar: hiển thị cho TẤT CẢ trang */}
      <Navbar />

      {/* Wrapper animation cho mỗi trang */}
      <div key={location.pathname} className="page-enter">
        <Routes location={location}>
          {/* ===== PUBLIC ROUTES ===== */}
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<CourseList />} />
          <Route path="/courses/:slug" element={<CourseDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ===== PRIVATE ROUTES ===== */}
          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />
          <Route path="/checkout" element={
            <ProtectedRoute><Checkout /></ProtectedRoute>
          } />
          <Route path="/my-learning" element={
            <ProtectedRoute><MyLearning /></ProtectedRoute>
          } />
          <Route path="/wishlist" element={
            <ProtectedRoute><Wishlist /></ProtectedRoute>
          } />
          <Route path="/learning/:slug" element={
            <ProtectedRoute><Learning /></ProtectedRoute>
          } />
          <Route path="/my-orders" element={
            <ProtectedRoute><MyOrders /></ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />

          {/* ===== ADMIN ROUTES ===== */}
          <Route path="/admin" element={
            <AdminRoute><AdminDashboard /></AdminRoute>
          } />
          <Route path="/admin/courses" element={
            <AdminRoute><AdminCourses /></AdminRoute>
          } />
          <Route path="/admin/categories" element={
            <AdminRoute><AdminCategories /></AdminRoute>
          } />
          <Route path="/admin/users" element={
            <AdminRoute><AdminUsers /></AdminRoute>
          } />
          <Route path="/admin/orders" element={
            <AdminRoute><AdminOrders /></AdminRoute>
          } />
          <Route path="/admin/coupons" element={
            <AdminRoute><AdminCoupons /></AdminRoute>
          } />

          {/* ===== FALLBACK ===== */}
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
    </>
  );
}

// ================================================
// APP COMPONENT: Root
// ================================================
function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
