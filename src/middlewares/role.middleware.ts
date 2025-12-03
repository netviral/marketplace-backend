// src/middlewares/role.middleware.ts
import { Request, Response, NextFunction } from "express";

export class RoleMiddleware {
  static requireStudent(req: Request, res: Response, next: NextFunction) {
    if (!req.user || !req.user.roles.includes("student")) {
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
    if (!req.user || req.user.role !== "admin") {
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
      if (!req.user || !roles.includes(req.user.roles)) {
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
