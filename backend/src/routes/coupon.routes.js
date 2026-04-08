// ================================================
// ROUTE: coupon.routes.js - Định tuyến API mã giảm giá
// Mô tả: CRUD coupon (Admin)
// ================================================
const express = require("express");
const router = express.Router();

const {
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/coupon.controller");

const { verifyToken, requireAdmin } = require("../middlewares/auth.middleware");

// CRUD Coupon - chỉ Admin
router.post("/", verifyToken, requireAdmin, createCoupon);
router.get("/", verifyToken, requireAdmin, getAllCoupons);
router.put("/:couponId", verifyToken, requireAdmin, updateCoupon);
router.delete("/:couponId", verifyToken, requireAdmin, deleteCoupon);

module.exports = router;
