import express from 'express';
import protectedRoute from '../middleware/protectedRoute';
import { addToCart, deleteFromCart, getCartItems, updateQuantity } from '../controllers/cart.controller';
const router = express.Router();

router.get("/", protectedRoute, getCartItems);
router.post("/add-to-cart", protectedRoute, addToCart);
router.put("/update-quantity", protectedRoute, updateQuantity);
router.delete("/", protectedRoute, deleteFromCart);

export default router;