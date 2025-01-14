import { Request, Response } from "express";
import db from '../lib/db';
import { clearCookies, comparePasswords, generateUserId, hashPassword, setCookies } from "../lib/util/auth.util";
import { User } from "../../shared/types/index";
import { createSystemLog } from "../lib/util/system_log.util";

// Create an account for new user
export const signup = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // check if user exists
    const [existingUser] = await db.query("SELECT email FROM users WHERE email = ?", [email]);
    if (existingUser && existingUser.length > 0) {
      return res.status(400).json({ message: "An account with that email already exists" });
    }

    // hash password
    const hashedPassword = await hashPassword(password);

    // create user_id
    const user_id = await generateUserId();

    // save user to database
    await db.query("INSERT INTO users (user_id, name, email, password) VALUES (?, ?, ?, ?)", [user_id, name, email, hashedPassword]);

    // set cookies
    await setCookies(res, user_id);

    const [users] = await db.query("SELECT * FROM users WHERE user_id = ?", [user_id]);
    const user: User = users[0];
    user.password = undefined;

    return res.status(201).json({
      message: "Signup Successful.",
      user
    });
  } catch (error) {
    console.error("Error in signup(): ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// Login to an existing account
export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // check if user exists
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (!users || users.length === 0) {
      return res.status(400).json({ message: "Invalid email and/or password." });
    }

    const user: User = users[0];

    // compare passwords
    if (user.password && !await comparePasswords(password, user.password)) {
      return res.status(400).json({ message: "Invalid email and/or password." });
    }

    // set cookies
    await setCookies(res, user.user_id);

    user.password = undefined;

    return res.status(200).json({
      message: "Login Successful.",
      user
    });

  } catch (error) {
    console.error("Error in login(): ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// Logout of an existing account
export const logout = async (req: Request, res: Response): Promise<any> => {
  try {
    // clear cookies
    clearCookies(res);

    return res.status(200).json({ message: "Logout Successful." });
  } catch (error) {
    console.error("Error in logout(): ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// Get user information
export const getMe = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = req.body.user;

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error in getMe(): ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// Delete user account
export const deleteUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = req.body.user;
    
    // delete user from database
    await db.query("DELETE FROM users WHERE user_id = ?", [user.user_id]);
    // clear the user's auth cookies
    clearCookies(res);

    return res.status(200).json({ message: "User account deleted." });
  } catch (error) {
    console.error("Error in deleteUser(): ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// SUPER ADMIN ROUTES

// Set the user's role using their email
export const setRole = async (req: Request, res: Response): Promise<any> => {
  try {
    
    const validRoles = [
      "member",
      "admin",
      "super-admin"
    ];

    const { user, email, role } = req.body;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    if (user.role !== "super-admin") {
      return res.status(403).json({ message: "Forbidden." });
    }

    if (!email || !role) {
      return res.status(400).json({ message: "Email and role are required." });
    }

    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }

    // check if user exists
    const [users] = await db.query("SELECT * FROM users WHERE LOWER(email) = LOWER(?)", [email]);
    if (!users || users.length === 0) {
      return res.status(400).json({ message: "User not found." });
    }

    if (users.length > 1) {
      return res.status(400).json({ message: "Multiple users found. Please contact support." });
    }

    const userToUpdate: User = users[0];

    // update user's role
    await db.query("UPDATE users SET role = ? WHERE user_id = ?", [role, userToUpdate.user_id]);

    // create system log
    await createSystemLog({
      user_id: user.user_id,
      log: `${user.name} changed ${userToUpdate.name}'s role to "${role}"`
    });
  
    return res.status(200).json({ message: `${userToUpdate.name}'s role changed to '${role}'` });

  } catch (error) {
    console.error("Error in setRole(): ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export const getAdmins = async (req: Request, res: Response): Promise<any> => {
  try {
    const [admins] = await db.query("SELECT * FROM users WHERE role = 'admin' OR role = 'super-admin' ORDER BY role = 'super-admin' DESC");

    return res.status(200).json(admins);

  } catch (error) {
    console.error("Error in getAdmins(): ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}