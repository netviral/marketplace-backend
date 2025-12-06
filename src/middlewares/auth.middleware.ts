import { Request, Response, NextFunction } from "express";
import { JwtService } from "../services/jwtService.js";
import UserService from "../services/UserService.js";
import { ApiResponse } from "../models/apiResponse.js";

export class AuthMiddleware {
  // -----------------------------
  // 1. Bearer Authentication
  // -----------------------------
  static async isBearerAuthenticated(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.api(
        ApiResponse.error(401, "Missing or invalid token", "AUTH_MISSING_TOKEN")
      );
    }

    const token = authHeader.split(" ")[1] || "";

    try {
      const decoded = JwtService.verifyAccessToken(token) as {
        email: string;
      };

      if (!decoded?.email) {
        return res.api(ApiResponse.error(403, "Invalid token payload", "AUTH_BAD_PAYLOAD"));
      }

      const fetchedUser = await UserService.getUserByEmail(decoded.email);
      if (!fetchedUser) {
        return res.api(ApiResponse.error(404, "User not found", "AUTH_USER_NOT_FOUND"));
      }

      req.user = fetchedUser;
      return next();
    } catch (err) {
      return res.api(ApiResponse.error(403, "Invalid or expired token", "AUTH_INVALID_TOKEN"));
    }
  }

  static async isNotBearerAuthenticated(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) return next();

    const token = authHeader.split(" ")[1] || "";

    try {
      const decoded = JwtService.verifyAccessToken(token) as { email: string };

      if (decoded?.email) {
        return res.api(
          ApiResponse.error(403, "Already logged in", "AUTH_ALREADY_AUTHENTICATED")
        );
      }

      return next();
    } catch {
      return next();
    }
  }

  // ====================================================
  // 2. Cookie Authentication — NEW MIDDLEWARES
  // ====================================================

  /**
   * Requires cookie-based JWT.
   */
  static async isCookieAuthenticated(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.accessToken;

    // Token must exist
    if (!token) {
      return res.api(ApiResponse.error(401, "Missing auth cookie", "COOKIE_MISSING_TOKEN"));
    }

    try {
      const decoded = JwtService.verifyAccessToken(token) as { email: string };
      if (!decoded?.email) {
        return res.api(ApiResponse.error(403, "Invalid token payload", "COOKIE_BAD_PAYLOAD"));
      }

      const user = await UserService.getUserByEmail(decoded.email);
      if (!user) {
        return res.api(ApiResponse.error(404, "User not found", "COOKIE_USER_NOT_FOUND"));
      }

      req.user = user;
      return next();
    } catch (err) {
      return res.api(
        ApiResponse.error(403, "Invalid or expired cookie token", "COOKIE_INVALID_TOKEN")
      );
    }
  }

  /**
   * Opposite: user should NOT have a valid cookie token.
   */
  static async isNotCookieAuthenticated(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.accessToken;

    // No cookie -> allow
    if (!token) return next();

    try {
      const decoded = JwtService.verifyAccessToken(token) as { email: string };

      // Valid cookie token means already logged in
      if (decoded?.email) {
        return res.api(
          ApiResponse.error(403, "Already logged in", "COOKIE_ALREADY_AUTHENTICATED")
        );
      }

      return next();
    } catch (err) {
      // Corrupted/expired token → treat like user is not logged in
      return next();
    }
  }
}
