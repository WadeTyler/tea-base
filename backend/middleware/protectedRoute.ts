import { NextFunction, Request, Response } from "express"
import { clearCookies, decodeAccessToken, decodeRefreshToken, generateAccessToken, setCookies } from "../lib/util/auth.util";
import db from '../lib/db';


const protectedRoute = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    // if there's no refresh token, clear the user's cookies and log them out.
    if (!refreshToken) {
      clearCookies(res);
      console.log("No refresh token found. Logging out user.");
      return res.status(401).json({ message: "Unauthorized." });
    }

    // if there's no access token generate new access token using refresh token
    if (!accessToken) {
      // generate new accessToken using refresh token
      const decoded = await decodeRefreshToken(refreshToken);

      if (!decoded) {
        clearCookies(res);
        console.log("Invalid access token. Logging out user.");
        return res.status(401).json({ message: "Unauthorized." });
      }

      // We have user_id in decoded object
      if (typeof decoded !== 'string' && decoded.user_id) {
        // refresh accessToken
        const accessToken = await generateAccessToken(decoded.user_id);
        res.cookie("accessToken", accessToken, {
          httpOnly: true, // prevents XSS attacks, cross site scripting attacks
          secure: process.env.NODE_ENV === "production", // only send cookie over HTTPS in production
          sameSite: "strict", // prevents CSRF attacks, cross-site request forgery 
          maxAge: 15 * 60 * 1000, // 15 mins
        });

        // add user to req body
        const [users] = await db.query("SELECT * FROM users WHERE user_id = ?", [decoded.user_id]);


        if (!users || users.length === 0) {
          clearCookies(res);
          return res.status(401).json({ message: "Unauthorized." });
        }

        const user = users[0];

        user.password = undefined;
        req.body.user = user;

        next();
        return;
      }

      console.log("No user_id in decoded object. Logging out user.");

      // no user_id in decoded object, so user is being malicious...
      // reset their tokens
      clearCookies(res);
      next();
    }

    // if we have access token and refresh token, check if access token is valid
    if (accessToken) {
      const decoded = await decodeAccessToken(accessToken);
      
      if (!decoded) {
        clearCookies(res);
        console.log("Invalid access token. Logging out user.");
        return res.status(401).json({ message: "Unauthorized." });
      }

      // we have token, verify it has user_id
      if (typeof decoded !== 'string' && decoded.user_id) {
        // console.log("Here is the decoded object: ", decoded);
        // add user to req body
        const [users] = await db.query("SELECT * FROM users WHERE user_id = ?", [decoded.user_id]);
        if (!users || users.length === 0) {
          clearCookies(res);
          console.log("User not found. Logging out user.");
          return res.status(401).json({ message: "Unauthorized." });
        }

        const user = users[0];

        // console.log("Here is the user: ", user);

        user.password = undefined;
        req.body.user = user;

        next();
        return;
      }
    }

    console.log("No user_id in decoded object. Logging out user.");
    // if we reach here, something went wrong
    clearCookies(res);
    return res.status(401).json({ message: "Unauthorized." });

  } catch (error) {
    console.error("Error in protectedRoute(): ", error);
    return res.status(500).json({ message: "Internal Server Error or Unauthorized." });
  }
}

export default protectedRoute;
