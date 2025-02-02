import express from 'express';
import protectedRoute from '../middleware/protectedRoute';
import adminRoute from '../middleware/adminRoute';
import { createCoupon, deleteCoupon, getAllCoupons, updateCoupon, verifyCoupon } from '../controllers/coupon.controller';
import checkMaintenance from '../middleware/checkMaintenance';
const router = express.Router();

router.get("/:coupon_id/verify", protectedRoute, checkMaintenance, verifyCoupon);

// Admin Routes
router.post("/", protectedRoute, adminRoute, createCoupon);
router.get("/", protectedRoute, adminRoute, getAllCoupons);
router.put("/:coupon_id", protectedRoute, adminRoute, updateCoupon);
router.delete("/:coupon_id", protectedRoute, adminRoute, deleteCoupon);

export default router;