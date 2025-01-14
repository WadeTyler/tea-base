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