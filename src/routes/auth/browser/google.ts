import express, { Request, Response } from "express";
import passport from "../../../config/passport.js";
import { JwtService } from "../../../services/jwtService.js";
import ensureGoogleRedirect  from "../../../middlewares/ensureGoogleRedirect.middleware.js";
import { ApiResponse } from "../../../models/apiResponse.model.js";
import JwtBody from "../../../models/jwt.payload.js";
import { AuthMiddleware } from "../../../middlewares/auth.middleware.js";
import ENV from "../../../env.js";


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

      const user = req.user as JwtBody;
      console.log("OAuth callback user:", user);
      // Generate tokens
      const accessToken = JwtService.generateAccessToken(user);

      const refreshToken = JwtService.generateRefreshToken(user);

      const cookieOptions = {
        httpOnly: true,
        sameSite: "lax" as const,
        secure: process.env.NODE_ENV === "production",
        path: "/",
      };

      res.cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: ENV.JWT_EXPIRES_IN_MS,
      });

      res.cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: ENV.JWT_REFRESH_EXPIRES_IN_MS,
      });

      return res.redirect(`${process.env.FRONTEND_REDIRECT_URL}`);
    } catch (err) {
      console.error("OAuth callback error:", err);
      return res.api(ApiResponse.error(500, "Internal Server Error"));
    }
  }
);


export default router;
