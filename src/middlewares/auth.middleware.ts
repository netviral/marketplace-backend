import { Request, Response, NextFunction } from "express";
import { JwtService } from "../services/jwtService.js";
import { ApiResponse } from "../models/apiResponse.js";
import UserService from "../services/UserService.js";

export class AuthMiddleware {
  static async isJWTAuthenticated(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    // 1. Check token exists + starts with Bearer
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.api(
        ApiResponse.error(401, "Missing or invalid token", "AUTH_MISSING_TOKEN")
      );
    }

    const token = authHeader.split(" ")[1] || "";

    try {
      // 2. Verify JWT
      const decoded = JwtService.verifyAccessToken(token) as {
        id: string;
        email: string;
      };

      if (!decoded || !decoded.email) {
        return res.api(
          ApiResponse.error(403, "Invalid token payload", "AUTH_BAD_PAYLOAD")
        );
      }

      // 3. Fetch full user object (DB)
      const fetchedUser = await UserService.getUserByEmail(decoded.email);

      if (!fetchedUser) {
        return res.api(
          ApiResponse.error(404, "User not found", "AUTH_USER_NOT_FOUND")
        );
      }

      // 4. Attach full User model to req
      req.user = fetchedUser;

      return next();
    } catch (err) {
      return res.api(
        ApiResponse.error(403, "Invalid or expired token", "AUTH_INVALID_TOKEN")
      );
    }
  }

  static async isNotJWTAuthenticated(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    // No token → user is NOT authenticated → allow them through
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1] || "";

    try {
      const decoded = JwtService.verifyAccessToken(token) as {
        id: string;
        email: string;
      };

      // If token verified → user should NOT be here → redirect or error
      if (decoded?.email) {
        return res.api(
          ApiResponse.error(403, "Already logged in", "AUTH_ALREADY_AUTHENTICATED")
        );
      }

      // Somehow decoded but no email → treat as not authenticated
      return next();
    } catch (err) {
      // Token invalid → user needs to log in → allow through
      return next();
    }
  }

}
