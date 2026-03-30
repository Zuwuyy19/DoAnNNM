import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      <style>
        {`
          .home-page {
            min-height: 100vh;
            width: 100vw;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #0a0c14;
            color: #f8fafc;
            position: relative;
            overflow: hidden; 
            font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
          }

          .home-content {
            text-align: center;
            z-index: 2;
            padding: 40px;
            animation: slideUp 0.8s ease-out;
          }

          .home-title {
            font-size: 4rem;
            font-weight: 800;
            margin-bottom: 16px;
            color: #ffffff;
          }

          .text-gradient {
            background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .home-subtitle {
            font-size: 1.25rem;
            color: #94a3b8; 
            margin-bottom: 40px;
          }

          .home-buttons {
            display: flex;
            gap: 20px;
            justify-content: center;
          }

          .btn {
            padding: 14px 32px;
            border-radius: 12px;
            font-size: 1.05rem;
            font-weight: 600;
            cursor: pointer;
            border: none;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
          }

          .btn-primary {
            background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
            color: white;
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
          }

          .btn-primary:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
          }

          .btn-outline {
            background: transparent;
            color: #f8fafc;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .btn-outline:hover {
            background: rgba(255, 255, 255, 0.05);
            border-color: rgba(255, 255, 255, 0.4);
            transform: translateY(-3px);
          }

          .glow {
            position: absolute;
            border-radius: 50%;
            filter: blur(100px);
            z-index: 1;
            opacity: 0.4;
            animation: pulse 6s infinite alternate;
          }

          .glow-1 {
            background: rgba(99, 102, 241, 0.5);
            width: 500px;
            height: 500px;
            top: -20%;
            left: -10%;
          }

          .glow-2 {
            background: rgba(236, 72, 153, 0.4);
            width: 400px;
            height: 400px;
            bottom: -20%;
            right: -10%;
            animation-delay: 2s;
          }

          @keyframes slideUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.3; }
            100% { transform: scale(1.1); opacity: 0.5; }
          }
        `}
      </style>

      {/* Cấu trúc HTML của trang chủ */}
      <div className="home-page">
        <div className="glow glow-1"></div>
        <div className="glow glow-2"></div>

        <div className="home-content">
          <h1 className="home-title">
            🚀 <span className="text-gradient">DevMaster</span>
          </h1>
          <p className="home-subtitle">Nền tảng học lập trình hàng đầu</p>

          <div className="home-buttons">
            <Link to="/courses" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)' }}>
              Khám phá Khóa học
            </Link>

            <Link to="/login" className="btn btn-primary">
              Đăng nhập
            </Link>

            <Link to="/register" className="btn btn-outline">
              Đăng ký
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}