import express, { Application } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';
import productRoutes from './routes/product.routes';
import couponRoutes from './routes/coupon.routes';
import reviewRoutes from './routes/review.routes';
import cartRoutes from './routes/cart.routes';
import systemLogRoutes from './routes/system_log.routes';


dotenv.config();

// middleware
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

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log("Server is running at port " + port);
});