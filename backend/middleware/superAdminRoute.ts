import { NextFunction, Request, Response } from "express";

const superAdminRoute = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const user = req.body.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    if (user.role !== "super-admin") {
      return res.status(403).json({ message: "Forbidden." });
    }

    next();
  } catch (error) {
    console.error("Error in superAdminRoute(): ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export default superAdminRoute;