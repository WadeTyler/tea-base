
import express, { Request, Response } from 'express';
import { getMaintenace, toggleMaintenance } from '..';
import protectedRoute from '../middleware/protectedRoute';
import superAdminRoute from '../middleware/superAdminRoute';
const router = express.Router();

router.get("/", protectedRoute, async (req: Request, res: Response): Promise<any> => {
  try {
    const maintenace = getMaintenace();

    return res.status(200).json({
      message: `${maintenace ? "Services currently under maintenance. Please try again later." : "Services currently available."}`,
      maintenace
    });


  } catch (error) {
    
  }
})

router.put("/toggle", protectedRoute, superAdminRoute, async (req: Request, res: Response): Promise<any> => {
  try {
    toggleMaintenance();
    const maintenace = getMaintenace();
    
    return res.status(200).json({
      message: "Maintenace mode toggled.",
      maintenace
    });

  } catch (error) {
    console.error("Error in toggleMaintenance(): ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
})

export default router;
