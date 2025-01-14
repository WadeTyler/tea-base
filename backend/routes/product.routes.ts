import express from 'express';
import protectedRoute from '../middleware/protectedRoute';
import adminRoute from '../middleware/adminRoute';
import { createProduct, deleteProduct, getAllProducts, getAllProductsInCategory, getFeaturedProducts, getProductById, setImageOrder, setSalePercentage, setStock, toggleFeatured } from '../controllers/product.controller';
import checkMaintenance from '../middleware/checkMaintenance';
const router = express.Router();


router.get("/", getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/:product_id", getProductById);
router.get("/category/:category_id", getAllProductsInCategory);

// Admin Routes
router.post("/", protectedRoute, adminRoute, createProduct);
router.delete("/:product_id", protectedRoute, adminRoute, deleteProduct);
router.put("/:product_id/toggle-featured", protectedRoute, adminRoute, toggleFeatured);
router.put("/:product_id/set-sale-percentage", protectedRoute, adminRoute, setSalePercentage);
router.put("/:product_id/set-stock", protectedRoute, adminRoute, setStock);
router.put("/:product_id/set-image-order", protectedRoute, adminRoute, setImageOrder);

export default router;