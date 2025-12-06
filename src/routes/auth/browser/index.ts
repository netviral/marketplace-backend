
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

const router = express.Router({ mergeParams: true });

router.use("/google", googleRouter);

router.get("/me", async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.accessToken;
    // console.log("ME token:", token);
    
    if (!token) {
      return res.api(ApiResponse.error(401, "Not logged in"));
    }

    const user = JwtService.verifyAccessToken(token) as JwtPayload;
    
    console.log("ME:", user);

    if (!user?.email) {
      return res.api(ApiResponse.error(401, "Invalid token. Please logout and log back in."));
    }

    const fetchedUser = await UserService.getUserByEmail(user.email);
    if (!fetchedUser) {
      return res.api(ApiResponse.error(404, "User does not exist"));
    }

    return res.api(
      ApiResponse.success(200, "User fetched", { isSignedIn:true, user })
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
  console.log("REFRESH token:", refreshToken);

  if (!refreshToken) {
    return res.api(
      ApiResponse.error(401, "Missing refresh token", "AUTH_MISSING_REFRESH")
    );
  }

  const newAccessToken = AuthService.refreshToken(refreshToken);
  console.log("NEW ACCESS TOKEN:", newAccessToken);

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