import { Request, Response, NextFunction } from "express";
import { JwtService } from "../services/jwtService.js";
import { ApiResponse } from "../models/apiResponse.js";
import UserService from "../services/UserService.js";

export class AuthMiddleware {
  static async authenticateJWT(req: Request, res: Response, next: NextFunction) {
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
}
