import { User } from '../../../shared/types';
import db from '../db';

export async function createSystemLog({
  user_id,
  log
}: {
  user_id: string;
  log: string;
}) {
  try {

    if (!user_id) {
      throw new Error("User id is required");
    }

    if (!log) {
      throw new Error("Log is required");
    }

    await db.query("INSERT INTO system_logs (user_id, log) VALUES(?, ?)", [user_id, log]);
    
    console.log("System log created");
  } catch (error) {
    throw error;
  }
}

// delete logs older than 90 days
export async function deleteOldSystemLogs() {
  try {

    await db.query("DELETE FROM system_logs WHERE timestamp < DATE_SUB(NOW(), INTERVAL 90 DAY)");
    console.log("Old system logs deleted");

  } catch (error) {
    throw error;
  }
}