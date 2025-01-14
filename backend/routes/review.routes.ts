import express from 'express';
import protectedRoute from '../middleware/protectedRoute';
import { createReview, deleteReview, deleteReviewByAdmin, getReviewsByProduct } from '../controllers/review.controller';
import adminRoute from '../middleware/adminRoute';
const router = express.Router();

router.get("/:product_id", protectedRoute, getReviewsByProduct);
router.post("/:product_id", protectedRoute, createReview);
router.delete("/:review_id", protectedRoute, deleteReview);

// Admin Routes
router.delete("/:review_id/admin-delete", protectedRoute, adminRoute, deleteReviewByAdmin);

export default router;