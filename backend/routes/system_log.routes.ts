import express from 'express';
import protectedRoute from '../middleware/protectedRoute';
import adminRoute from '../middleware/adminRoute';
import { getAllSystemLogs } from '../controllers/system_log.controller';
const router = express.Router();

router.get("/", protectedRoute, adminRoute, getAllSystemLogs);

export default router;