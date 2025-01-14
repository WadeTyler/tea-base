import express from 'express';
import protectedRoute from '../middleware/protectedRoute';
import adminRoute from '../middleware/adminRoute';
import { createProduct, deleteProduct, getAllProducts, getAllProductsInCategory, getProductById, setSalePercentage, setStock, toggleFeatured } from '../controllers/product.controller';
const router = express.Router();


router.get("/", getAllProducts);
router.get("/:product_id", getProductById);
router.get("/category/:category_id", getAllProductsInCategory);
// Admin Routes
router.post("/", protectedRoute, adminRoute, createProduct);
router.delete("/:product_id", protectedRoute, adminRoute, deleteProduct);
router.put("/:product_id/toggle-featured", protectedRoute, adminRoute, toggleFeatured);
router.put("/:product_id/set-sale-percentage", protectedRoute, adminRoute, setSalePercentage);
router.put("/:product_id/set-stock", protectedRoute, adminRoute, setStock);

export default router;