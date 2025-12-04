// src/middlewares/role.middleware.ts
import { Request, Response, NextFunction } from "express";
import User from "../models/User.model.js";

export class RoleMiddleware {
  static requireStudent(req: Request, res: Response, next: NextFunction) {
    const user = req.user as User;
    if (!user || !user.roles.includes("student")) {
      return res.api({
        success: false,
        code: 403,
        message: "Only students can access this route.",
        data:null,
        error: "not_student"
      });
    }
    next();
  }

  static requireAdmin(req: Request, res: Response, next: NextFunction) {
    const user = req.user as User;
    if (user.isAdmin() === false) {
      return res.api({
        success: false,
        code: 403,
        message: "Admin access only.",
        data:null,
        error: "not_admin"
      });
    }
    next();
  }

  static requireRole(roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      const user = req.user as User;
      if (!user || !roles.some(role => user.roles.includes(role))) {
        return res.api({
          success: false,
          code: 403,
          message: "User does not have permission.",
          data: null,
          error: "role_unauthorized"
        });
      }
      next();
    };
  }
}
