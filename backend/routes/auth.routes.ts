import express from 'express';
import { getMe, login, signup } from '../controllers/auth.controller';
import protectedRoute from '../middleware/protectedRoute';
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/", protectedRoute, getMe);

export default router;