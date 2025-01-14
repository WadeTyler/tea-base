import { NextFunction, Request, Response } from "express";
import { getMaintenace } from "..";

const checkMaintenance = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const user = req.body.user;
    if (user && (user.role === "super-admin" || user.role === "admin")) {
      next();
      return;
    }

    if (getMaintenace()) {
      return res.status(503).json({ message: "Service Unavailable. Try again later." });
    }

    next();
  } catch (error) {
    console.error("Error in checkMaintenance(): ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export default checkMaintenance;