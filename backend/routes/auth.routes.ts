import express from 'express';
import { deleteUser, getAdmins, getMe, login, logout, setRole, signup } from '../controllers/auth.controller';
import protectedRoute from '../middleware/protectedRoute';
import adminRoute from '../middleware/adminRoute';
import superAdminRoute from '../middleware/superAdminRoute';
import checkMaintenance from '../middleware/checkMaintenance';
const router = express.Router();

router.post("/signup", checkMaintenance, signup);
router.post("/login", login);
router.delete("/logout", logout);
router.get("/", protectedRoute, checkMaintenance, getMe);
router.delete("/", protectedRoute, checkMaintenance, deleteUser);

// Super Admin Routes
router.put("/set-role", protectedRoute, superAdminRoute, setRole);
router.get("/admins", protectedRoute, superAdminRoute, getAdmins);

export default router;