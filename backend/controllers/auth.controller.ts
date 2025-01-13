import { Request, Response } from "express";
import db from '../config/db';
import { clearCookies, comparePasswords, generateUserId, hashPassword, setCookies } from "../lib/util/auth.util";
import { User } from "../../shared/types/index";

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

    const user = await db.query("SELECT * FROM users WHERE user_id = ?", [user_id])[0];
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

export const getMe = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = req.body.user;

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error in getMe(): ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}