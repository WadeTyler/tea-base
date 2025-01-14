import express from 'express';
import protectedRoute from '../middleware/protectedRoute';
import adminRoute from '../middleware/adminRoute';
import { createCoupon, deleteCoupon, getAllCoupons, updateCoupon } from '../controllers/coupon.controller';
const router = express.Router();


// Admin Routes
router.post("/", protectedRoute, adminRoute, createCoupon);
router.get("/", protectedRoute, adminRoute, getAllCoupons);
router.put("/:coupon_id", protectedRoute, adminRoute, updateCoupon);
router.delete("/:coupon_id", protectedRoute, adminRoute, deleteCoupon);

export default router;