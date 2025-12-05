import express from "express";
import passport from "../../config/passport.js"; 
import { JwtService } from "../../services/jwtService.js";
import { ApiResponse } from "../../models/apiResponse.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Step 1: Redirect user to Google, if unathenticated
router.get(
  "/google", AuthMiddleware.isNotJWTAuthenticated,
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Step 2: Google redirects back to backend
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  async (req: any, res) => {
    const user = req.user;

    const accessToken = JwtService.generateAccessToken({
      email: user.email,
      googleId: user.googleId,
    });

    const refreshToken = JwtService.generateRefreshToken({
      email: user.email,
      googleId: user.googleId,
    });

    // ---- SET COOKIES HERE ----
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // Set to true in production with HTTPS
      maxAge: 1000 * 60 * 15, // 15 min
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    });

    // redirect back to frontend
    return res.redirect("http://localhost:5173/dashboard");
  }
);


export default router;
