import express from 'express';
import { deleteUser, getMe, login, logout, signup } from '../controllers/auth.controller';
import protectedRoute from '../middleware/protectedRoute';
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.delete("/logout", logout);
router.get("/", protectedRoute, getMe);
router.delete("/", protectedRoute, deleteUser);

export default router;