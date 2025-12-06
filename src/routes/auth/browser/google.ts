import express, { Request, Response } from "express";
import passport from "../../../config/passport.js";
import { JwtService } from "../../../services/jwtService.js";
import ensureGoogleRedirect  from "../../../middlewares/ensureGoogleRedirect.middleware.js";
import { ApiResponse } from "../../../models/apiResponse.model.js";
import { AuthMiddleware } from "../../../middlewares/auth.middleware.js";

const router = express.Router({ mergeParams: true });
/**
 * /auth/browser/google
 * Browser-initiated OAuth flow
 */

router.get(
  "/",
  AuthMiddleware.isNotCookieAuthenticated,
  passport.authenticate("google", { scope: ["profile", "email"] }),
  async (req: Request, res: Response) => {
    console.log("Initiating Google OAuth flow");
  }
);

/**
 * /auth/browser/google/callback
 */
router.get(
  "/callback", ensureGoogleRedirect, 
  passport.authenticate("google", { session: false }),
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.api(ApiResponse.error(401, "Authentication failed"));
      }

      const user = req.user as { email: string; googleId: string };

      // Generate tokens
      const accessToken = JwtService.generateAccessToken({
        sub: user.googleId,
        email: user.email,
      });

      const refreshToken = JwtService.generateRefreshToken({
        sub: user.googleId,
      });

      const cookieOptions = {
        httpOnly: true,
        sameSite: "lax" as const,
        secure: process.env.NODE_ENV === "production",
        path: "/",
      };

      res.cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: 1000 * 60 * 15,
      });

      res.cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: 1000 * 60 * 60 * 24 * 30,
      });

      return res.redirect(`${process.env.FRONTEND_REDIRECT_URL}`);
    } catch (err) {
      console.error("OAuth callback error:", err);
      return res.api(ApiResponse.error(500, "Internal Server Error"));
    }
  }
);


export default router;
