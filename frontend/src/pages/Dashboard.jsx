import { useEffect, useState } from "react";
import "../styles/dashboard.css";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <>
      {/* Navbar */}
      <header id="header">
        <div className="container nav-wrapper">
          <a href="/" className="logo">
            <i className="ph-fill ph-code"></i>
            Dev<span>Master</span>
          </a>

          <nav className="desktop-nav">
            <a href="#home" className="active">Trang Chủ</a>
            <a href="#features">Đặc Điểm</a>
            <a href="#courses">Khóa Học</a>
          </nav>

          <div className="nav-actions">
            {!user ? (
              <>
                <a href="/login" className="btn btn-outline">Đăng Nhập</a>
                <a href="/register" className="btn btn-primary">Đăng Ký</a>
              </>
            ) : (
              <>
                <span style={{ marginRight: "10px" }}>
                  👋 {user.name}
                </span>
                <button onClick={handleLogout} className="btn btn-outline">
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO */}
      <section id="home" className="hero section-padding">
        <div className="container hero-container">
          <div className="hero-content">
            <div className="badge">🚀 Khóa học lập trình hàng đầu Việt Nam</div>

            <h1>
              Làm Chủ Code <br />
              <span className="text-gradient">Kiến Tạo Tương Lai</span>
            </h1>

            <p>
              Học lập trình qua các dự án thực tế với mentor giàu kinh nghiệm.
            </p>

            <div className="hero-buttons">
              <a href="#courses" className="btn btn-primary btn-large">
                Khám phá ngay
              </a>
            </div>

            <div className="stats">
              <div className="stat-item">
                <h3>50k+</h3>
                <p>Học Viên</p>
              </div>
              <div className="stat-item">
                <h3>200+</h3>
                <p>Khóa Học</p>
              </div>
              <div className="stat-item">
                <h3>4.9/5</h3>
                <p>Đánh Giá</p>
              </div>
            </div>
          </div>

          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97"
              alt="hero"
            />
          </div>
        </div>

        <div className="glow glow-1"></div>
        <div className="glow glow-2"></div>
      </section>

      {/* FEATURES */}
      <section id="features" className="features section-padding">
        <div className="container">
          <div className="section-title">
            <h2>
              Tại Sao Chọn <span className="text-gradient">DevMaster?</span>
            </h2>
          </div>

          <div className="features-grid">
            <div className="feature-card glass-panel">
              <h3>Dự án thực tế</h3>
              <p>Học qua project thực chiến</p>
            </div>

            <div className="feature-card glass-panel">
              <h3>Mentor 1:1</h3>
              <p>Hỗ trợ tận tình</p>
            </div>

            <div className="feature-card glass-panel">
              <h3>Chứng nhận</h3>
              <p>Chứng chỉ uy tín</p>
            </div>
          </div>
        </div>
      </section>

      {/* COURSES */}
      <section id="courses" className="courses section-padding">
        <div className="container">
          <div className="section-title">
            <h2>
              Khóa Học <span className="text-gradient">Nổi Bật</span>
            </h2>
          </div>

          <div className="courses-grid">
            {/* Course 1 */}
            <div className="course-card glass-panel">
              <img
                src="https://images.unsplash.com/photo-1547658719-da2b51169166"
                alt=""
              />
              <h3>Frontend từ Zero</h3>
              <button className="btn btn-primary">Đăng ký</button>
            </div>

            {/* Course 2 */}
            <div className="course-card glass-panel">
              <img
                src="https://images.unsplash.com/photo-1555099962-4199c345e5dd"
                alt=""
              />
              <h3>JavaScript Pro</h3>
              <button className="btn btn-primary">Đăng ký</button>
            </div>

            {/* Course 3 */}
            <div className="course-card glass-panel">
              <img
                src="https://images.unsplash.com/photo-1633356122544-f134324a6cee"
                alt=""
              />
              <h3>ReactJS Thực Chiến</h3>
              <button className="btn btn-primary">Đăng ký</button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section section-padding">
        <div className="container">
          <div className="cta-card glass-panel">
            <h2>
              Sẵn Sàng Bắt Đầu{" "}
              <span className="text-gradient">Hành Trình?</span>
            </h2>

            <button className="btn btn-primary">
              Bắt đầu miễn phí
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <h3>DevMaster</h3>
            <p>Nền tảng học lập trình hàng đầu</p>
          </div>

          <div>
            <h4>Khóa học</h4>
            <p>ReactJS</p>
            <p>NodeJS</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 DevMaster</p>
        </div>
      </footer>
    </>
  );
}