import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';
dotenv.config(); 

// used to hash a password
export async function hashPassword(password: string) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

// compare normal password to a hashed password
export async function comparePasswords(password: string, hashedPassword: string) {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
}

export async function generateRefreshToken(user_id: string) {
  const secret = process.env.REFRESH_TOKEN_SECRET;

  if (!secret) {
    throw new Error("Environment variable REFRESH_TOKEN_SECRET is not defined");
  }

  const token = jwt.sign(
    {user_id},
    secret,
    {expiresIn: '7d'}
  );

  return token;
}

export async function generateAccessToken(user_id: string) {
  const secret = process.env.ACCESS_TOKEN_SECRET;

  if (!secret) {
    throw new Error("Environment variable ACCESS_TOKEN_SECRET is not defined");
  }
  
  const token = jwt.sign(
    {user_id},
    secret,
    {expiresIn: '15m' } // expires in 15 min
  );

  return token;
}

export async function generateUserId() {
  const user_id = uuidv4();
  return user_id;
}

export async function setCookies(res: Response, user_id: string) {
  const refreshToken = await generateRefreshToken(user_id);
  const accessToken = await generateAccessToken(user_id);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // prevents XSS attacks, cross site scripting attacks
    secure: process.env.NODE_ENV === "production", // only send cookie over HTTPS in production
    sameSite: "strict", // prevents CSRF attacks, cross-site request forgery 
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  })

  res.cookie("accessToken", accessToken, {
    httpOnly: true, // prevents XSS attacks, cross site scripting attacks
    secure: process.env.NODE_ENV === "production", // only send cookie over HTTPS in production
    sameSite: "strict", // prevents CSRF attacks, cross-site request forgery 
    maxAge: 15 * 60 * 1000, // 15 mins
  })
}

export async function clearCookies(res: Response) {
  res.clearCookie("refreshToken");
  res.clearCookie("accessToken");
}

export async function decodeAccessToken(token: string) {
  const secret = process.env.ACCESS_TOKEN_SECRET;

  if (!secret) {
    throw new Error("Environment variable ACCESS_TOKEN_SECRET is not defined");
  }

  const decoded = jwt.verify(token, secret);
  return decoded;
}

export async function decodeRefreshToken(token: string) {
  const secret = process.env.REFRESH_TOKEN_SECRET;

  if (!secret) {
    throw new Error("Environment variable REFRESH_TOKEN_SECRET is not defined");
  }

  const decoded = jwt.verify(token, secret);
  return decoded;
}


