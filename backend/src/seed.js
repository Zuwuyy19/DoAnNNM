// ================================================
// SEED SCRIPT: Tạo dữ liệu mẫu ban đầu
// Mô tả: Script chạy một lần để tạo admin account,
// instructors, courses, orders, reviews, coupons vào MongoDB
// Cách chạy: node src/seed.js
// ================================================
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Import models
const User = require("./models/User");
const Category = require("./models/Category");
const Course = require("./models/Course");
const Order = require("./models/Order");
const Coupon = require("./models/Coupon");

// ================================================
// Dữ liệu mẫu: Categories
// ================================================
const categoriesData = [
  {
    name: "Frontend",
    slug: "frontend",
    description: "Khóa học về giao diện người dùng: HTML, CSS, JavaScript, React, Vue, Angular",
    icon: "fas fa-desktop",
    color: "#6366f1",
    order: 1,
  },
  {
    name: "Backend",
    slug: "backend",
    description: "Khóa học về lập trình phía server: NodeJS, Python, Java, Go, Database",
    icon: "fas fa-server",
    color: "#10b981",
    order: 2,
  },
  {
    name: "DevOps",
    slug: "devops",
    description: "Khóa học về triển khai và vận hành: Docker, Kubernetes, CI/CD, Cloud",
    icon: "fas fa-cloud",
    color: "#f59e0b",
    order: 3,
  },
  {
    name: "Mobile",
    slug: "mobile",
    description: "Khóa học phát triển ứng dụng di động: React Native, Flutter, Swift, Kotlin",
    icon: "fas fa-mobile-alt",
    color: "#ec4899",
    order: 4,
  },
  {
    name: "Data Science",
    slug: "data-science",
    description: "Khóa học về khoa học dữ liệu: Python, Machine Learning, AI, Big Data",
    icon: "fas fa-chart-bar",
    color: "#8b5cf6",
    order: 5,
  },
];

// ================================================
// Dữ liệu mẫu: Instructors (Giảng viên)
// ================================================
const instructorsData = [
  {
    name: "Nguyễn Văn Minh",
    email: "minh.instructor@devmaster.com",
    bio: "Senior Frontend Developer tại Google với 8 năm kinh nghiệm. Chuyên gia React, TypeScript và Performance Optimization.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
    role: "instructor",
  },
  {
    name: "Trần Thị Lan",
    email: "lan.instructor@devmaster.com",
    bio: "Tech Lead Backend tại FPT Software. Chuyên gia NodeJS, MongoDB, Microservices và Cloud Architecture.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
    role: "instructor",
  },
  {
    name: "Lê Hoàng Nam",
    email: "nam.instructor@devmaster.com",
    bio: "DevOps Engineer tại VNG Corporation. Chuyên gia Docker, Kubernetes, CI/CD Pipeline và AWS Cloud.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80",
    role: "instructor",
  },
  {
    name: "Phạm Thu Hà",
    email: "ha.instructor@devmaster.com",
    bio: "Mobile Developer tại Viettel. Chuyên gia Flutter, Dart và thiết kế UI/UX cho ứng dụng di động.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80",
    role: "instructor",
  },
  {
    name: "Đặng Minh Tuấn",
    email: "tuan.instructor@devmaster.com",
    bio: "Data Scientist tại FPT AI. Chuyên gia Python, Machine Learning, Deep Learning và Data Visualization.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80",
    role: "instructor",
  },
];

// ================================================
// Dữ liệu mẫu: Courses (Khóa học)
// ================================================
const coursesData = [
  {
    title: "ReactJS từ Zero đến Hero",
    slug: "reactjs-tu-zero-den-hero",
    description:
      "Khóa học ReactJS toàn diện từ cơ bản đến nâng cao. Bạn sẽ học cách xây dựng các ứng dụng web hiện đại với React, bao gồm component, state, props, hooks, router, Redux và NextJS.\n\nKhóa học bao gồm 50+ bài học video, 10+ dự án thực tế, bài tập thực hành sau mỗi chương. Phù hợp cho người mới bắt đầu muốn trở thành Frontend Developer chuyên nghiệp.",
    price: 799000,
    discountPrice: 499000,
    level: "Beginner",
    language: "english",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
    prerequisites: "Có kiến thức cơ bản về HTML, CSS và JavaScript",
    whatYouLearn:
      "Xây dựng ứng dụng web với React\nSử dụng Hooks và Context API\nQuản lý state với Redux Toolkit\nRouting với React Router\nTriển khai ứng dụng React lên production",
    tags: ["react", "javascript", "frontend", "web"],
    isFeatured: true,
    enrolledCount: 1247,
    totalLessons: 52,
    totalDuration: 1200,
    averageRating: 4.8,
    totalReviews: 342,
    categorySlug: "frontend",
    instructorIdx: 0,
    reviews: [
      { rating: 5, comment: "Khóa học rất chi tiết, giảng viên dạy dễ hiểu. Đã xin được job Frontend sau khi học xong!" },
      { rating: 5, comment: "Từ zero đến hero thật sự! Mình không biết gì về React mà giờ đã làm được dự án thật." },
      { rating: 4, comment: "Nội dung phong phú, có nhiều bài tập thực hành. Giá học phí hợp lý." },
    ],
  },
  {
    title: "NodeJS & Express - Backend Master",
    slug: "nodejs-express-backend-master",
    description:
      "Khóa học NodeJS chuyên sâu giúp bạn trở thành Backend Developer thực thụ. Học cách xây dựng RESTful API, xác thực JWT, kết nối MongoDB, xử lý error, deployment và scaling.\n\nBao gồm 60+ bài học video, 5+ dự án thực chiến (e-commerce, social network, CMS).",
    price: 999000,
    discountPrice: 699000,
    level: "Intermediate",
    language: "english",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80",
    prerequisites: "Biết JavaScript cơ bản, HTML/CSS",
    whatYouLearn:
      "Xây dựng RESTful API với Express\nXác thực với JWT & OAuth\nKết nối MongoDB với Mongoose\nMiddleware & Error Handling\nDeploy lên VPS và Cloud",
    tags: ["nodejs", "express", "backend", "mongodb", "api"],
    isFeatured: true,
    enrolledCount: 983,
    totalLessons: 65,
    totalDuration: 1500,
    averageRating: 4.7,
    totalReviews: 218,
    categorySlug: "backend",
    instructorIdx: 1,
    reviews: [
      { rating: 5, comment: "Giảng viên giỏi, dạy từ cơ bản đến nâng cao rất rõ ràng. Học xong tự tin làm backend." },
      { rating: 4, comment: "Nội dung cập nhật, có nhiều best practice. Mình đã áp dụng được ngay vào công việc." },
    ],
  },
  {
    title: "Python cho người mới bắt đầu",
    slug: "python-cho-nguoi-moi-bat-dau",
    description:
      "Khóa học Python từ con số 0 dành cho người hoàn toàn chưa biết lập trình. Python là ngôn ngữ dễ học nhất, được sử dụng rộng rãi trong Data Science, AI, Web Development và Automation.\n\n40+ bài học video, bài tập thực hành sau mỗi chương, dự án cuối khóa: xây dựng ứng dụng Todo List và Web Scraper.",
    price: 0,
    discountPrice: null,
    level: "Beginner",
    language: "english",
    image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&q=80",
    prerequisites: "Không cần kiến thức lập trình trước",
    whatYouLearn:
      "Cú pháp cơ bản của Python\nBiến, kiểu dữ liệu, vòng lặp\nHàm và module\nXử lý file và exception\nXây dựng dự án thực tế",
    tags: ["python", "beginner", "programming"],
    isFeatured: true,
    enrolledCount: 2156,
    totalLessons: 42,
    totalDuration: 900,
    averageRating: 4.9,
    totalReviews: 567,
    categorySlug: "data-science",
    instructorIdx: 4,
    reviews: [
      { rating: 5, comment: "Miễn phí mà chất lượng quá tốt! Giảng viên dạy rất dễ hiểu cho người mới hoàn toàn." },
      { rating: 5, comment: "Từ chưa biết gì đến viết được chương trình đầu tiên. Khóa học miễn phí tốt nhất mình từng học!" },
      { rating: 5, comment: "Python dễ học lắm mọi người ơi. Giảng viên Tuấn dạy cực kỳ dễ hiểu." },
    ],
  },
  {
    title: "Docker & Kubernetes Master",
    slug: "docker-kubernetes-master",
    description:
      "Khóa học DevOps chuyên sâu về Container và Orchestration. Học cách đóng gói ứng dụng với Docker, quản lý container với Kubernetes, CI/CD pipeline và monitoring.\n\nPhù hợp cho Backend Developer và DevOps Engineer muốn nâng cao kỹ năng deployment.",
    price: 1299000,
    discountPrice: 899000,
    level: "Advanced",
    language: "english",
    image: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&q=80",
    prerequisites: "Có kinh nghiệm Linux, biết lập trình backend",
    whatYouLearn:
      "Docker: Container, Image, Volume, Network\nKubernetes: Pod, Deployment, Service\nHelm Charts & ConfigMap\nCI/CD với GitHub Actions\nMonitoring với Prometheus & Grafana",
    tags: ["docker", "kubernetes", "devops", "container", "ci/cd"],
    isFeatured: false,
    enrolledCount: 456,
    totalLessons: 38,
    totalDuration: 1080,
    averageRating: 4.6,
    totalReviews: 89,
    categorySlug: "devops",
    instructorIdx: 2,
    reviews: [
      { rating: 5, comment: "Khóa học DevOps tốt nhất! Giảng viên Nam có kinh nghiệm thực tế rất nhiều." },
      { rating: 4, comment: "Nội dung chuyên sâu, phù hợp với người đã có nền tảng. Học xong tự deploy được app lên K8s." },
    ],
  },
  {
    title: "TypeScript Thực Chiến",
    slug: "typescript-thuc-chien",
    description:
      "Nâng cấp kỹ năng JavaScript của bạn với TypeScript. Khóa học tập trung vào các pattern thực tế, best practices và cách tích hợp TypeScript vào các dự án React/NodeJS.\n\n30+ bài học video, nhiều hands-on exercises, xây dựng 3 dự án hoàn chỉnh.",
    price: 599000,
    discountPrice: 399000,
    level: "Intermediate",
    language: "english",
    image: "https://images.unsplash.com/photo-1619410283995-43d9134e7656?w=800&q=80",
    prerequisites: "Biết JavaScript cơ bản",
    whatYouLearn:
      "Type system của TypeScript\nInterface, Type, Generics\nDecorators & Utility Types\nTích hợp TypeScript vào React\nTích hợp TypeScript vào NodeJS",
    tags: ["typescript", "javascript", "programming"],
    isFeatured: false,
    enrolledCount: 723,
    totalLessons: 33,
    totalDuration: 720,
    averageRating: 4.5,
    totalReviews: 156,
    categorySlug: "frontend",
    instructorIdx: 0,
    reviews: [
      { rating: 5, comment: "TypeScript rất quan trọng trong dự án thật. Khóa học giúp mình tự tin hơn khi code." },
      { rating: 4, comment: "Nội dung thực tế, có nhiều ví dụ từ dự án thật. Giá cả hợp lý." },
    ],
  },
  {
    title: "Flutter - Ứng dụng di động đa nền tảng",
    slug: "flutter-ung-dung-di-dong",
    description:
      "Học cách xây dựng ứng dụng di động cho iOS và Android chỉ với một codebase duy nhất sử dụng Flutter và Dart.\n\n55+ bài học video, 8+ dự án thực tế từ cơ bản đến nâng cao bao gồm: ứng dụng shopping, social app, game nhỏ.",
    price: 899000,
    discountPrice: 599000,
    level: "Intermediate",
    language: "english",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80",
    prerequisites: "Biết lập trình cơ bản (bất kỳ ngôn ngữ nào)",
    whatYouLearn:
      "Dart cơ bản và nâng cao\nFlutter Widgets & Layout\nState Management với Provider & Riverpod\nNavigation & HTTP requests\nBuild và release ứng dụng",
    tags: ["flutter", "dart", "mobile", "ios", "android"],
    isFeatured: false,
    enrolledCount: 534,
    totalLessons: 55,
    totalDuration: 1320,
    averageRating: 4.7,
    totalReviews: 112,
    categorySlug: "mobile",
    instructorIdx: 3,
    reviews: [
      { rating: 5, comment: "Flutter là xu hướng! Học xong khóa này mình đã làm được app iOS và Android từ một codebase." },
      { rating: 5, comment: "Giảng viên Hà dạy rất kỹ từ cơ bản. Có đầy đủ dự án thực tế để thực hành." },
    ],
  },
  {
    title: "MongoDB & Database Design",
    slug: "mongodb-database-design",
    description:
      "Khóa học chuyên sâu về MongoDB và thiết kế database. Từ cơ bản đến nâng cao: CRUD, Aggregation Pipeline, Indexing, Sharding và Replica Set.\n\nPhù hợp cho developer muốn nắm vững NoSQL database.",
    price: 699000,
    discountPrice: 499000,
    level: "Intermediate",
    language: "english",
    image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80",
    prerequisites: "Biết lập trình cơ bản, hiểu JSON",
    whatYouLearn:
      "MongoDB cơ bản và nâng cao\n Thiết kế Schema hiệu quả\nAggregation Pipeline & MapReduce\nIndexing & Performance Optimization\nReplica Set & Sharding",
    tags: ["mongodb", "database", "backend", "nosql"],
    isFeatured: false,
    enrolledCount: 389,
    totalLessons: 40,
    totalDuration: 960,
    averageRating: 4.6,
    totalReviews: 78,
    categorySlug: "backend",
    instructorIdx: 1,
    reviews: [
      { rating: 5, comment: "MongoDB mình tưởng khó nhưng khóa này dạy rất dễ hiểu. Giờ tự tin thiết kế database." },
    ],
  },
  {
    title: "AWS Cloud Fundamentals",
    slug: "aws-cloud-fundamentals",
    description:
      "Khóa học AWS từ cơ bản dành cho developer. Học cách sử dụng EC2, S3, Lambda, RDS, CloudFront và nhiều dịch vụ AWS khác.\n\nBao gồm 30+ bài học và bài lab thực hành để chuẩn bị cho kỳ thi AWS Certified Cloud Practitioner.",
    price: 1499000,
    discountPrice: 999000,
    level: "Intermediate",
    language: "english",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
    prerequisites: "Biết cơ bản về Linux và networking",
    whatYouLearn:
      "EC2, S3, Lambda cơ bản\nRDS & DynamoDB\nCloudFront CDN\nIAM & Security Best Practices\nChuẩn bị thi AWS Cloud Practitioner",
    tags: ["aws", "cloud", "devops", "infrastructure"],
    isFeatured: false,
    enrolledCount: 312,
    totalLessons: 35,
    totalDuration: 840,
    averageRating: 4.4,
    totalReviews: 67,
    categorySlug: "devops",
    instructorIdx: 2,
    reviews: [
      { rating: 4, comment: "Khóa học AWS tốt, có nhiều bài lab thực hành. Giúp mình hiểu rõ về cloud." },
    ],
  },
];

// ================================================
// Dữ liệu mẫu: Coupons
// ================================================
const couponsData = [
  {
    code: "WELCOME2026",
    name: "Chào mừng thành viên mới",
    discountType: "percent",
    discountValue: 20,
    maxDiscountAmount: 200000,
    usageLimit: 1000,
    usedCount: 234,
    startDate: new Date("2026-01-01"),
    endDate: new Date("2026-12-31"),
    isActive: true,
  },
  {
    code: "SUMMER2026",
    name: "Summer Sale 2026",
    discountType: "percent",
    discountValue: 30,
    maxDiscountAmount: 300000,
    usageLimit: 500,
    usedCount: 189,
    startDate: new Date("2026-04-01"),
    endDate: new Date("2026-06-30"),
    isActive: true,
  },
  {
    code: "FASTLEARN",
    name: "Học nhanh - Giảm ngay",
    discountType: "fixed",
    discountValue: 150000,
    usageLimit: null,
    usedCount: 456,
    startDate: new Date("2026-01-01"),
    endDate: new Date("2026-12-31"),
    isActive: true,
  },
  {
    code: "BLACKFRIDAY",
    name: "Black Friday 2025",
    discountType: "percent",
    discountValue: 50,
    maxDiscountAmount: 500000,
    usageLimit: 200,
    usedCount: 200,
    startDate: new Date("2025-11-25"),
    endDate: new Date("2025-11-30"),
    isActive: false,
  },
  {
    code: "LAZDAY",
    name: "LazDay Voucher",
    discountType: "percent",
    discountValue: 15,
    maxDiscountAmount: 100000,
    usageLimit: null,
    usedCount: 678,
    startDate: new Date("2026-01-01"),
    endDate: new Date("2026-12-31"),
    isActive: true,
  },
];

// ================================================
// Dữ liệu mẫu: Regular Users (Học viên)
// ================================================
const usersData = [
  { name: "Trần Bảo Long", email: "longhv@email.com", enrolledCourses: 0 },
  { name: "Nguyễn Thị Mai", email: "mainguyen@email.com", enrolledCourses: 0 },
  { name: "Lê Đức Anh", email: "anhle@email.com", enrolledCourses: 0 },
  { name: "Phạm Minh Tuấn", email: "tuanpm@email.com", enrolledCourses: 0 },
  { name: "Hoàng Thu Hà", email: "hath@email.com", enrolledCourses: 0 },
  { name: "Đặng Quang Minh", email: "minhdq@email.com", enrolledCourses: 0 },
  { name: "Vũ Thị Lan", email: "lanvu@email.com", enrolledCourses: 0 },
  { name: "Bùi Hoàng Nam", email: "nambh@email.com", enrolledCourses: 0 },
];

// ================================================
// HÀM CHÍNH: Chạy seed
// ================================================
async function seed() {
  try {
    // ===== KẾT NỐI MONGODB =====
    console.log("🔄 Đang kết nối MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Kết nối MongoDB thành công!\n");

    // ================================================
    // BƯỚC 1: XÓA DỮ LIỆU CŨ (bỏ comment nếu muốn reset hoàn toàn)
    // ================================================
    // await User.deleteMany({});
    // await Category.deleteMany({});
    // await Course.deleteMany({});
    // await Order.deleteMany({});
    // await Coupon.deleteMany({});
    // console.log("🗑️ Đã xóa dữ liệu cũ");

    // ================================================
    // BƯỚC 2: TẠO TÀI KHOẢN ADMIN
    // ================================================
    console.log("👤 Đang tạo tài khoản Admin...");
    const adminExists = await User.findOne({ email: "admin@devmaster.com" });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await User.create({
        name: "Quản trị viên",
        email: "admin@devmaster.com",
        password: hashedPassword,
        role: "admin",
        isEmailVerified: true,
      });
      console.log("   ✅ Admin đã được tạo!");
      console.log("   📧 Email: admin@devmaster.com");
      console.log("   🔑 Password: admin123\n");
    } else {
      console.log("   ℹ️  Tài khoản Admin đã tồn tại\n");
    }

    // ================================================
    // BƯỚC 3: TẠO GIẢNG VIÊN
    // ================================================
    console.log("👨‍🏫 Đang tạo giảng viên...");
    const createdInstructors = [];
    for (const instrData of instructorsData) {
      const exists = await User.findOne({ email: instrData.email });
      if (!exists) {
        const hashedPassword = await bcrypt.hash("instructor123", 10);
        const instructor = await User.create({
          ...instrData,
          password: hashedPassword,
          isEmailVerified: true,
        });
        createdInstructors.push(instructor);
        console.log(`   ✅ ${instrData.name} (${instrData.email})`);
      } else {
        createdInstructors.push(exists);
        console.log(`   ℹ️  ${instrData.name} đã tồn tại`);
      }
    }
    console.log("");

    // ================================================
    // BƯỚC 4: TẠO DANH MỤC
    // ================================================
    console.log("📂 Đang tạo danh mục...");
    const categoryMap = {};
    for (const catData of categoriesData) {
      let category = await Category.findOne({ slug: catData.slug });
      if (!category) {
        category = await Category.create(catData);
        console.log(`   ✅ ${catData.name}`);
      } else {
        console.log(`   ℹ️  ${catData.name} đã tồn tại`);
      }
      categoryMap[catData.slug] = category;
    }
    console.log("");

    // ================================================
    // BƯỚC 5: TẠO KHÓA HỌC
    // ================================================
    console.log("📚 Đang tạo khóa học...");
    const createdCourses = [];
    for (const courseData of coursesData) {
      const exists = await Course.findOne({ slug: courseData.slug });
      if (!exists) {
        const categoryId = categoryMap[courseData.categorySlug]?._id;
        const instructorId =
          createdInstructors[courseData.instructorIdx]?._id || null;
        const instructorName =
          createdInstructors[courseData.instructorIdx]?.name || "DevMaster Team";

        // Tạo khóa học
        const course = await Course.create({
          title: courseData.title,
          slug: courseData.slug,
          description: courseData.description,
          price: courseData.price,
          discountPrice: courseData.discountPrice,
          category: categoryId,
          instructor: instructorId,
          authorName: instructorName,
          level: courseData.level,
          language: courseData.language,
          image: courseData.image,
          prerequisites: courseData.prerequisites,
          whatYouLearn: courseData.whatYouLearn,
          tags: courseData.tags,
          isFeatured: courseData.isFeatured,
          enrolledCount: courseData.enrolledCount,
          totalLessons: courseData.totalLessons,
          totalDuration: courseData.totalDuration,
          averageRating: courseData.averageRating,
          totalReviews: courseData.totalReviews,
          status: "published",
        });
        createdCourses.push(course);
        console.log(`   ✅ ${courseData.title} (${courseData.enrolledCount} học viên)`);
      } else {
        createdCourses.push(exists);
        console.log(`   ℹ️  ${courseData.title} đã tồn tại`);
      }
    }
    console.log("");

    // ================================================
    // BƯỚC 6: TẠO MÃ GIẢM GIÁ
    // ================================================
    console.log("🎟️ Đang tạo mã giảm giá...");
    for (const couponData of couponsData) {
      const exists = await Coupon.findOne({ code: couponData.code });
      if (!exists) {
        await Coupon.create(couponData);
        console.log(`   ✅ ${couponData.code} - ${couponData.name}`);
      } else {
        console.log(`   ℹ️  ${couponData.code} đã tồn tại`);
      }
    }
    console.log("");

    // ================================================
    // BƯỚC 7: TẠO HỌC VIÊN + ĐƠN HÀNG + REVIEWS
    // ================================================
    console.log("👨‍🎓 Đang tạo học viên và đơn hàng...");
    for (let i = 0; i < usersData.length; i++) {
      const userData = usersData[i];
      let user = await User.findOne({ email: userData.email });

      if (!user) {
        const hashedPassword = await bcrypt.hash("user123456", 10);
        user = await User.create({
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: "user",
          isEmailVerified: true,
        });
      }

      // Đăng ký 2-4 khóa học ngẫu nhiên cho mỗi user
      const randomCourses = createdCourses
        .sort(() => Math.random() - 0.5)
        .slice(0, 2 + (i % 3));

      for (const course of randomCourses) {
        // Thêm vào enrolledCourses nếu chưa có
        if (!user.enrolledCourses.includes(course._id)) {
          user.enrolledCourses.push(course._id);
        }

        // Tạo review ngẫu nhiên (có 60% chance)
        if (Math.random() < 0.6) {
          const courseDoc = await Course.findById(course._id);
          const rating = 3 + Math.floor(Math.random() * 3); // 3-5 sao
          const comments = [
            "Khóa học rất bổ ích, giảng viên dạy dễ hiểu!",
            "Nội dung thực tế, áp dụng được ngay vào công việc.",
            "Rất hài lòng với khóa học này. Đáng để đầu tư!",
            "Mình đã học nhiều khóa nhưng đây là khóa tốt nhất!",
            "Chất lượng vượt xa giá tiền. Highly recommended!",
          ];
          const comment = comments[Math.floor(Math.random() * comments.length)];

          const alreadyReviewed = courseDoc.reviews.some(
            (r) => r.user?.toString() === user._id.toString()
          );
          if (!alreadyReviewed) {
            courseDoc.reviews.push({
              user: user._id,
              rating,
              comment,
              createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            });

            // Cập nhật averageRating
            const totalRating = courseDoc.reviews.reduce((sum, r) => sum + r.rating, 0);
            courseDoc.averageRating = parseFloat(
              (totalRating / courseDoc.reviews.length).toFixed(1)
            );
            courseDoc.totalReviews = courseDoc.reviews.length;
            await courseDoc.save();
          }
        }

        // Tạo đơn hàng cho khóa học có phí
        if (course.price > 0) {
          const existingOrder = await Order.findOne({
            user: user._id,
            "items.course": course._id,
          });
          if (!existingOrder) {
            const priceToUse = course.discountPrice || course.price;
            const orderNumber = `DM-2026${String(i + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;

            await Order.create({
              user: user._id,
              items: [
                {
                  course: course._id,
                  priceAtPurchase: priceToUse,
                },
              ],
              totalAmount: priceToUse,
              paymentMethod: ["vnpay", "momo", "banking", "cod"][
                Math.floor(Math.random() * 4)
              ],
              paymentStatus: ["paid", "paid", "pending"][
                Math.floor(Math.random() * 3)
              ],
              orderStatus: "completed",
              orderNumber,
              buyerEmail: user.email,
              createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
            });
          }
        }
      }

      await user.save();
      console.log(`   ✅ ${userData.name} - ${randomCourses.length} khóa học đã đăng ký`);
    }

    // ================================================
    // BƯỚC 8: TẠO THÊM 1 SỐ ĐƠN HÀNG MẪU CHO KHÓA CÓ GIẢM GIÁ
    // ================================================
    console.log("\n💰 Đang tạo đơn hàng mẫu với mã giảm giá...");
    const firstUser = await User.findOne({ email: usersData[0].email });
    const firstCourse = createdCourses[0]; // ReactJS
    if (firstUser && firstCourse && firstCourse.discountPrice) {
      const existing = await Order.findOne({
        user: firstUser._id,
        "items.course": firstCourse._id,
        couponCode: { $exists: true },
      });
      if (!existing) {
        await Order.create({
          user: firstUser._id,
          items: [
            {
              course: firstCourse._id,
              priceAtPurchase: firstCourse.discountPrice,
            },
          ],
          totalAmount: firstCourse.discountPrice,
          couponCode: "WELCOME2026",
          discountAmount: Math.round(
            (firstCourse.price - firstCourse.discountPrice) * 0.2
          ),
          paymentMethod: "vnpay",
          paymentStatus: "paid",
          orderStatus: "completed",
          orderNumber: "DM-202604-1001",
          buyerEmail: firstUser.email,
        });
        console.log("   ✅ Đơn hàng với mã WELCOME2026 đã được tạo");
      }
    }

    // ================================================
    // HOÀN TẤT
    // ================================================
    console.log("\n🎉 ═══════════════════════════════════════════");
    console.log("   SEED HOÀN TẤT! Dữ liệu mẫu đã được tạo");
    console.log("🎉 ═══════════════════════════════════════════\n");
    console.log("📌 TÀI KHOẢN ĐĂNG NHẬP:\n");
    console.log("   🛡️  ADMIN:");
    console.log("      Email: admin@devmaster.com");
    console.log("      Password: admin123\n");
    console.log("   👨‍🏫 GIẢNG VIÊN (ví dụ):");
    console.log("      Email: minh.instructor@devmaster.com");
    console.log("      Password: instructor123\n");
    console.log("   👤 HỌC VIÊN (ví dụ):");
    console.log("      Email: longhv@email.com");
    console.log("      Password: user123456\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi seed:", error);
    process.exit(1);
  }
}

// Chạy seed
seed();
