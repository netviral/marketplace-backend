import express, { Request, Response } from "express";
import passport from "../../../config/passport.js";
import { JwtService } from "../../../services/jwtService.js";
import { AuthMiddleware } from "../../../middlewares/auth.middleware.js";
import ensureGoogleRedirect  from "../../../middlewares/ensureGoogleRedirect.middleware.js";
import UserService from "../../../services/UserService.js";
import { ApiResponse } from "../../../models/apiResponse.model.js";
import { JwtPayload } from "jsonwebtoken";

const router = express.Router({ mergeParams: true });

// ---- Custom JWT Payload ----
interface AppJwtPayload extends JwtPayload {
  email: string;
  sub: string; // googleId
}

/**
 * /auth/browser/google
 * Browser-initiated OAuth flow
 */
router.get(
  "/google",
  AuthMiddleware.isNotCookieAuthenticated,
  passport.authenticate("google", { scope: ["profile", "email"] })
);

/**
 * /auth/browser/google/callback
 */
router.get(
  "/google/callback", ensureGoogleRedirect, 
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
