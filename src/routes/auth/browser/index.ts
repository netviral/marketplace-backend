
import express, { Request, Response } from "express";
import { JwtService } from "../../../services/jwtService.js";
import { AuthMiddleware } from "../../../middlewares/auth.middleware.js";
import UserService from "../../../services/UserService.js";
import { ApiResponse } from "../../../models/apiResponse.model.js";
import { JwtPayload } from "jsonwebtoken";
import { AuthService } from "../../../services/AuthService.js";
import googleRouter from "./google.js";

const app = express();
app.use(express.json());
// ---- Custom JWT Payload ----
interface AppJwtPayload extends JwtPayload {
  email: string;
  sub: string; // googleId
}

const router = express.Router({ mergeParams: true });

router.use("/google", googleRouter);

router.get("/me", async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.accessToken;
    // console.log("ME token:", token);
    
    if (!token) {
      return res.api(ApiResponse.error(401, "Not logged in"));
    }

    const decoded = JwtService.verifyAccessToken(token) as AppJwtPayload;
    console.log("ME decoded:", decoded);

    if (!decoded?.email) {
      return res.api(ApiResponse.error(401, "Invalid token. Please logout and log back in."));
    }

    const user = await UserService.getUserByEmail(decoded.email);
    if (!user) {
      return res.api(ApiResponse.error(404, "User does not exist"));
    }

    return res.api(
      ApiResponse.success(200, "User fetched", { user })
    );
  } catch (err) {
    console.error("ME error:", err);
    return res.api(ApiResponse.error(401, "Invalid or expired token"));
  }
});


/**
 * /auth/browser/logout
 * Clears cookies
 */

router.post("/refresh", (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.api(
      ApiResponse.error(401, "Missing refresh token", "AUTH_MISSING_REFRESH")
    );
  }

  const newAccessToken = AuthService.refreshToken(refreshToken);

  if (!newAccessToken) {
    return res.api(
      ApiResponse.error(
        403,
        "Invalid or expired refresh token. Login again from /auth/browser/google",
        "AUTH_EXPIRED_REFRESH"
      )
    );
  }

  // IMPORTANT: write new access token cookie
  res.cookie("accessToken", newAccessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",       // or strict
    path: "/",
    maxAge: 15 * 60 * 1000 // 15 min
  });

  // you can return empty json or success message
  return res.api(
    ApiResponse.success(200, "Token refreshed", null)
  );
});


router.get("/logout", AuthMiddleware.isCookieAuthenticated, (req: Request, res: Response) => {
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/" });

  return res.api(
    ApiResponse.success(202, "Logged out successfully", {})
  );
});

export default router;