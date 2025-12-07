/// <reference path="../types/express.d.ts" />
// ============================================
// VENDOR OWNERSHIP MIDDLEWARE
// ============================================
// Middleware to check if the authenticated user is an owner of a vendor.
// Used for operations that require vendor ownership (update, delete).

import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database.config.js";
import { ApiResponse } from "../models/apiResponse.model.js";
import User from "../models/User.model.js";

/**
 * Checks if the authenticated user is an owner of the vendor
 * @param req - Express request object (expects vendor ID in params)
 * @param res - Express response object
 * @param next - Express next function
 * @description Verifies that the current user is listed as an owner of the vendor
 */
export const checkVendorOwnership = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const user = req.user as User | undefined;

        // Check if user is authenticated
        if (!user || !user.email) {
            res.api(ApiResponse.error(401, "Unauthorized: No user information found", "unauthorized"));
            return;
        }

        // Validate vendor ID
        if (!id) {
            res.api(ApiResponse.error(400, "Vendor ID is required", "missing_vendor_id"));
            return;
        }

        // Fetch vendor and check ownership
        const vendor = await prisma.vendor.findUnique({
            where: { id },
            include: {
                owners: {
                    where: { email: user.email }
                }
            }
        });

        if (!vendor) {
            res.api(ApiResponse.error(404, "Vendor not found", "vendor_not_found"));
            return;
        }

        // Check if user is an owner
        if (vendor.owners.length === 0) {
            res.api(
                ApiResponse.error(
                    403,
                    "Forbidden: You are not authorized to perform this action. Only vendor owners can make changes.",
                    "not_vendor_owner"
                )
            );
            return;
        }

        // User is authorized, proceed to next middleware/controller
        next();
    } catch (error) {
        console.error("Error checking vendor ownership:", error);
        res.api(ApiResponse.error(500, "Error checking vendor ownership", "server_error"));
    }
};

// Default export for backward compatibility
export default checkVendorOwnership;