import express, { Application } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

// Routes
import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';
import productRoutes from './routes/product.routes';
import couponRoutes from './routes/coupon.routes';
import reviewRoutes from './routes/review.routes';
import cartRoutes from './routes/cart.routes';
import systemLogRoutes from './routes/system_log.routes';
import maintenanceRoutes from './routes/maintenance.routes';

dotenv.config();;

// Global Variable States
var maintenace = false;

// Middleware
const app: Application = express();
app.use(express.json({
  limit: "10mb"
}));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/system-logs", systemLogRoutes);
app.use("/api/maintenance", maintenanceRoutes);

// UTIL FUNCTIONS
export const toggleMaintenance = () => {
  maintenace = !maintenace;
}

export const getMaintenace = () => {
  return maintenace;
}

// Start Server
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log("Server is running at port " + port);
});