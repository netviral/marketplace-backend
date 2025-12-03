import { Request, Response, NextFunction } from "express";
import { JwtService } from "../services/jwtService.js";

export class AuthMiddleware {
  static authenticateJWT(req: Request, res: Response, next: NextFunction){
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.api({
        success: false,
        code: 401,
        message: "Missing or invalid token",
        data: null,
        error: "AUTH_MISSING_TOKEN"
      });
    }

    const token = authHeader.split(" ")[1] || "";

    try {
      const decoded = JwtService.verifyAccessToken(token);
      req.user = decoded;
      console.log(req.user);
      return next();
    } catch (err) {
      return res.api({
        success: false,
        code: 403,
        message: "Invalid or expired token",
        data: null,
        error: "AUTH_INVALID_TOKEN"
      });
    }
  }
}
