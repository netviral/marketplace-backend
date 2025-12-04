import express from "express";
import passport from "../../config/passport.js"; 
import { JwtService } from "../../services/jwtService.js";

const router = express.Router();

// Step 1: Redirect user to Google
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Step 2: Google redirects back to backend
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }),
  async (req: any, res) => {
    const user = req.user;

    // Create JWT tokens
    const accessToken = JwtService.generateAccessToken({
      email: user.email,
      googleId: user.googleId,
    });

    const refreshToken = JwtService.generateRefreshToken({
      email: user.email,
      googleId: user.googleId,
    });

    // Redirect back to frontend with tokens
    const redirectUrl = `http://localhost:3000/oauth-success?accessToken=${accessToken}&refreshToken=${refreshToken}`;

    return res.redirect(redirectUrl);
  }
);

export default router;
