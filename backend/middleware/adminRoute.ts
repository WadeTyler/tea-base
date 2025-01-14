import { NextFunction, Request, Response } from "express";

const adminRoute = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {

    // user should be added to req.body in protectedRoute middleware.
    // always call protectedRoute before adminRoute
    const user = req.body.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden." });
    }

    next();
  } catch (error) {
    console.error("Error in adminRoute(): ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export default adminRoute;