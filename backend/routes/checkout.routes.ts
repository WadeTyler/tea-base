import express from 'express';
import protectedRoute from '../middleware/protectedRoute';
import checkMaintenance from '../middleware/checkMaintenance';
import { createCheckoutSession } from '../controllers/checkout.controller';
const router = express.Router();

router.post("/create-checkout-session", protectedRoute, checkMaintenance, createCheckoutSession);

export default router;