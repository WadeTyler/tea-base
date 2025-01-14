import express from 'express';
import protectedRoute from '../middleware/protectedRoute';
import { addToCart, deleteFromCart, getCartItems, updateQuantity } from '../controllers/cart.controller';
import checkMaintenance from '../middleware/checkMaintenance';
const router = express.Router();

router.get("/", protectedRoute, checkMaintenance, getCartItems);
router.post("/add-to-cart", protectedRoute, checkMaintenance, addToCart);
router.put("/update-quantity", protectedRoute, checkMaintenance, updateQuantity);
router.delete("/", protectedRoute, checkMaintenance, deleteFromCart);

export default router;