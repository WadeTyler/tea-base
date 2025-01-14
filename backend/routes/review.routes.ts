import express from 'express';
import protectedRoute from '../middleware/protectedRoute';
import { createReview, deleteReview, deleteReviewByAdmin, getReviewsByProduct } from '../controllers/review.controller';
import adminRoute from '../middleware/adminRoute';
import checkMaintenance from '../middleware/checkMaintenance';
const router = express.Router();

router.get("/:product_id", protectedRoute, checkMaintenance, getReviewsByProduct);
router.post("/:product_id", protectedRoute, checkMaintenance, createReview);
router.delete("/:review_id", protectedRoute, checkMaintenance, deleteReview);

// Admin Routes
router.delete("/:review_id/admin-delete", protectedRoute, adminRoute, deleteReviewByAdmin);

export default router;