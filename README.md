# DevMaster - Nền Tảng Bán Khóa Học Online

> Website bán khóa học lập trình online với giao diện sáng chuyên nghiệp, sử dụng MERN Stack.

---

## 1. Cấu Trúc Dự Án

```
DoAnNNM/
├── backend/           # Server Node.js + Express + MongoDB
│   └── src/
│       ├── controllers/   # Logic xử lý API
│       ├── models/         # Schema MongoDB
│       ├── routes/         # Định tuyến API
│       ├── middlewares/    # Middleware xác thực
│       └── utils/          # Hàm tiện ích
├── frontend/          # Client React (Vite)
│   └── src/
│       ├── pages/          # Các trang (Home, Login, Course...)
│       ├── components/     # Component dùng chung (Navbar)
│       ├── services/       # Gọi API
│       └── styles/         # CSS
└── README.md
```

---

## 2. Yêu Cầu Hệ Thống

- **Node.js** >= 18.x
- **MongoDB** đang chạy ở `localhost:27017`
- **npm** hoặc **yarn**

---

## 3. Cài Đặt & Chạy Dự Án

### 3.1. Cài đặt dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3.2. Chạy Backend

```bash
cd backend
npm run dev
```

- Backend chạy tại: **http://localhost:4000**
- API documentation: **http://localhost:4000/api**

### 3.3. Chạy Frontend

```bash
cd frontend
npm run dev
```

- Frontend chạy tại: **http://localhost:5173**

> **Lưu ý:** Frontend tự động proxy `/api` và `/uploads` sang backend qua Vite config.

---

## 4. Tạo Dữ Liệu Mẫu (Seed Data)

```bash
cd backend
npm run seed
```

Script sẽ tạo:

| Dữ liệu | Số lượng |
|---|---|
| Người dùng | 15 (1 admin, 5 instructor, 9 user) |
| Khóa học | 8 khóa học |
| Danh mục | 6 danh mục |
| Mã giảm giá | 5 mã coupon |
| Đơn hàng | Nhiều đơn hàng mẫu |

---

## 5. Tài Khoản Demo

### Tài khoản Admin

| Email | Password |
|---|---|
| `admin@devmaster.com` | `admin123` |

### Tài khoản Giảng viên

| Email | Password |
|---|---|
| `longhv@email.com` | `user123456` |
| `nguyentran@email.com` | `user123456` |

### Tài khoản Học viên

| Email | Password |
|---|---|
| `tranbon2192004@gmail.com` | `user123456` |
| `student@devmaster.com` | `user123456` |

---

## 6. Các Tính Năng Chính

### 6.1. Người dùng (User)

- [x] Đăng ký / Đăng nhập tài khoản
- [x] Xem danh sách khóa học (tìm kiếm, lọc, phân trang)
- [x] Xem chi tiết khóa học
- [x] Thêm vào giỏ hàng
- [x] Thanh toán COD (thanh toán khi nhận hàng)
- [x] Áp dụng mã giảm giá (coupon)
- [x] Đăng ký khóa học miễn phí
- [x] Xem khóa học đã đăng ký (My Learning)
- [x] Viết đánh giá khóa học (sau khi đã đăng ký)
- [x] Danh sách yêu thích (Wishlist)
- [x] Xem lịch sử đơn hàng
- [x] Cập nhật thông tin cá nhân

### 6.2. Quản trị (Admin)

- [x] Dashboard thống kê (doanh thu, học viên, khóa học)
- [x] Quản lý khóa học (CRUD)
- [x] Quản lý danh mục (CRUD)
- [x] Quản lý người dùng (xem, đổi vai trò, khóa/mở tài khoản)
- [x] Quản lý đơn hàng (xem, cập nhật trạng thái)
- [x] Quản lý mã giảm giá (CRUD)

### 6.3. Giảng viên (Instructor)

- [x] Tạo khóa học mới
- [x] Cập nhật khóa học của mình
- [x] Xem danh sách khóa học đã tạo

---

## 7. API Endpoints

### Authentication
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/auth/register` | Đăng ký tài khoản |
| POST | `/api/auth/login` | Đăng nhập |
| GET | `/api/auth/profile` | Lấy thông tin profile |
| PUT | `/api/auth/profile` | Cập nhật profile |
| PUT | `/api/auth/change-password` | Đổi mật khẩu |

### Courses
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/courses` | Danh sách khóa học |
| GET | `/api/courses/:slug` | Chi tiết khóa học |
| POST | `/api/courses` | Tạo khóa học (Instructor/Admin) |
| PUT | `/api/courses/:courseId` | Cập nhật khóa học |
| DELETE | `/api/courses/:courseId` | Xóa khóa học (Admin) |
| POST | `/api/courses/:courseId/reviews` | Thêm đánh giá |
| POST | `/api/courses/:courseId/wishlist` | Toggle wishlist |
| GET | `/api/courses/my/enrolled` | Khóa học đã đăng ký |

### Orders
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/orders` | Tạo đơn hàng |
| POST | `/api/orders/apply-coupon` | Áp dụng mã giảm giá |
| GET | `/api/orders/my` | Danh sách đơn hàng của tôi |
| PATCH | `/api/orders/:orderId/status` | Cập nhật trạng thái (Admin) |

### Categories
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/categories` | Danh sách danh mục |
| POST | `/api/categories` | Tạo danh mục (Admin) |
| PUT | `/api/categories/:id` | Cập nhật danh mục |
| DELETE | `/api/categories/:id` | Xóa danh mục |

### Coupons
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/coupons` | Danh sách mã giảm giá |
| POST | `/api/coupons` | Tạo mã giảm giá (Admin) |
| PUT | `/api/coupons/:id` | Cập nhật mã |
| DELETE | `/api/coupons/:id` | Xóa mã |

---

## 8. Các Lệnh Hữu Ích

```bash
# Chạy seed data (reset database và tạo data mới)
cd backend && npm run seed

# Xóa database (chạy seed lại từ đầu)
# Chỉ cần chạy lại: npm run seed

# Kiểm tra backend có chạy không
curl http://localhost:4000/api/courses

# Reset password user thủ công (node script)
node -e "
const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./backend/src/models/User');
  const bcrypt = require('bcryptjs');
  const user = await User.findOne({ email: 'tranbon2192004@gmail.com' });
  user.password = await bcrypt.hash('user123456', 10);
  await user.save();
  console.log('Done!');
  await mongoose.disconnect();
});
"
```

---

## 9. Cấu Hình Môi Trường

### Backend (`backend/.env`)

```env
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/online_course_db
JWT_SECRET=devmaster_jwt_secret_key_2024
ACCESS_TOKEN_SECRET=devmaster_access_token_2024
NODE_ENV=development
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=/api
```

---

## 10. Luồng Người Dùng

### Đăng ký khóa học miễn phí

1. Đăng nhập → `/login`
2. Vào **Khóa Học** → Chọn khóa miễn phí → `/courses`
3. Click **"Đăng ký miễn phí"** → Tự động chuyển sang `/checkout`
4. Click **"Đặt hàng ngay"** → Thanh toán COD
5. Đơn hàng thành công → Tự động chuyển sang `/my-learning`
6. Khóa học xuất hiện trong **"Khóa học của tôi"**

### Mua khóa học có phí

1. Đăng nhập → Vào **Khóa Học** → Chọn khóa
2. Click **"Mua khóa học"** → Chuyển sang `/checkout`
3. (Tùy chọn) Nhập **mã giảm giá** (ví dụ: `DEVMASTER10`, `SUMMER2024`)
4. Click **"Đặt hàng ngay"**
5. Đơn hàng COD → Thanh toán khi nhận hàng
6. Chuyển đến **"Khóa học của tôi"**

### Sử dụng mã giảm giá

| Mã | Loại | Giá trị |
|---|---|---|
| `DEVMASTER10` | Giảm % | 10% |
| `SUMMER2024` | Giảm tiền | 100,000đ |
| `WELCOME50` | Giảm % | 50% (tối đa 200,000đ) |
| `NEWUSER` | Giảm % | 15% |
| `HOTDEAL` | Giảm tiền | 200,000đ |

---

## 11. Xử Lý Lỗi Thường Gặp

### Lỗi "Cannot connect to MongoDB"

```bash
# Kiểm tra MongoDB đã chạy chưa
mongosh --eval "db.version()"
# Hoặc khởi động MongoDB service
brew services start mongodb-community
```

### Lỗi "Token hết hạn"

- Đăng nhập lại tại `/login`
- Token sẽ được tự động xóa và chuyển về trang login

### Lỗi "Bạn đã đăng ký khóa học này rồi"

- Khóa học đã có trong danh sách **"Khóa học của tôi"**
- Không thể mua lại khóa học đã đăng ký

### Frontend không load được dữ liệu

1. Kiểm tra backend đang chạy ở port 4000
2. Kiểm tra MongoDB đang chạy
3. Chạy lại seed data: `cd backend && npm run seed`

---

## 12. Công Nghệ Sử Dụng

| Phần | Công nghệ |
|---|---|
| Frontend | React 18 + Vite + React Router v6 |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT (JSON Web Token) + bcrypt |
| Styling | CSS (custom, light theme) |
| HTTP Client | Axios |
| Password Hashing | bcryptjs |
| Slug Generation | slugify |
