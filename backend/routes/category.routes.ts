import express from 'express';
import { createCategory, deleteCategory, getAllCategories, updateCategory } from '../controllers/category.controller';
import protectedRoute from '../middleware/protectedRoute';
import adminRoute from '../middleware/adminRoute';
const router = express.Router();

// These routes are not used to CRUD products, just category table specifically.

router.get("/", getAllCategories);
router.post("/", protectedRoute, adminRoute, createCategory);
router.delete("/:category_id", protectedRoute, adminRoute, deleteCategory);
router.put("/:category_id", protectedRoute, adminRoute, updateCategory);


export default router;