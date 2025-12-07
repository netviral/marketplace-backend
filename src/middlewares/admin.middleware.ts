/// <reference path="../types/express.d.ts" />
import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../models/apiResponse.model.js";
import User from "../models/User.model.js";

export default async function checkIsAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const user = req.user as User | undefined;

        if (!user) {
            res.api(ApiResponse.error(401, "Unauthorized: No user information found", "unauthorized"));
            return;
        }

        const hasAdminRole = user.roles && Array.isArray(user.roles) && user.roles.includes('admin');
        const isAdminFlag = user.isAdmin();

        if (!hasAdminRole && !isAdminFlag) {
            res.api(ApiResponse.error(403, "Forbidden: Admin access required", "not_admin"));
            return;
        }

        next();
    } catch (error) {
        console.error("Error checking admin status:", error);
        res.api(ApiResponse.error(500, "Error checking admin status", "server_error"));
    }
}
