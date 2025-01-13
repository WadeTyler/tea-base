import express, { Application } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
dotenv.config();

// middleware
const app: Application = express();
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log("Server is running at port " + port);
});