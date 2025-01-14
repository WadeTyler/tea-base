import { Request, Response } from 'express';
import db from '../lib/db';
import { deleteOldSystemLogs } from '../lib/util/system_log.util';

export const getAllSystemLogs = async (req: Request, res: Response): Promise<any> => {
  try {

    const [system_logs] = await db.query("SELECT * FROM system_logs ORDER BY timestamp DESC LIMIT 50");

    // Delete logs older than 90 days
    deleteOldSystemLogs();

    return res.status(200).json(system_logs);

  } catch (error) {
    console.error("Error in getAllSystemLogs: ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}