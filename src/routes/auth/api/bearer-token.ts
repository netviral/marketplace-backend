import express, { Request, Response } from "express";
import { AuthService } from "../../../services/AuthService.js";
import { JwtService } from "../../../services/jwtService.js";
import { ApiResponse } from "../../../models/apiResponse.model.js";
import UserService from "../../../services/UserService.js";
import { AuthMiddleware } from "../../../middlewares/auth.middleware.js";

const router = express.Router();
router.use(express.json());

/**
 * LOGIN — Verify API Key and issue tokens
 * Issues both accessToken and refreshToken
 */
router.post("/login",  AuthMiddleware.isNotBearerAuthenticated, async (req: Request, res: Response) => {
  try {
    const { email, apiKey } = req.body;

    const user = await UserService.verifyApiKey(email, apiKey);
    if (user === null) {
      return res.api(ApiResponse.error(401, "User does not Exist or Invalid credentials"));
    }

    const payload =  {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
        imageUrl: user.imageUrl,
    };

    const accessToken = JwtService.generateAccessToken(payload);
    const refreshToken = JwtService.generateRefreshToken(payload);

    return res.api(
      ApiResponse.success(200, "Login successful", {
        accessToken,
        refreshToken,
        user,
      })
    );
  } catch (err) {
    console.error("LOGIN error:", err);
    return res.api(ApiResponse.error(500, "Internal server error"));
  }
});

/**
 * /ME — Fetch logged-in user using *only* Access Token (Bearer)
 */
router.get("/me", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.api(ApiResponse.error(401, "Missing Bearer token"));
    }

    const token = authHeader.split(" ")[1] || "";
    const decoded = JwtService.verifyAccessToken(token);

    if (typeof decoded !== "object" || !decoded?.email) {
      return res.api(ApiResponse.error(401, "Invalid token"));
    }

    const user = await UserService.getUserByEmail(decoded.email);
    if (!user) {
      return res.api(ApiResponse.error(404, "User not found"));
    }

    return res.api(ApiResponse.success(200, "User fetched", { user }));
  } catch (err) {
    console.error("ME error:", err);
    return res.api(ApiResponse.error(401, "Invalid or expired token"));
  }
});

/**
 * REFRESH — Refresh access token using Refresh Token in body
 */
router.post("/refresh", (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.api(
      ApiResponse.error(400, "Missing refresh token", "AUTH_MISSING_REFRESH")
    );
  }

  const newAccessToken = AuthService.refreshToken(refreshToken);

  if (!newAccessToken) {
    return res.api(
      ApiResponse.error(
        403,
        "Invalid or expired refresh token",
        "AUTH_EXPIRED_REFRESH"
      )
    );
  }

  return res.api(
    ApiResponse.success(200, "Token refreshed", {
      accessToken: newAccessToken,
    })
  );
});

export default router;
