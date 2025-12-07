/// <reference path="../types/express.d.ts" />
// ============================================
// VENDOR ACCESS MIDDLEWARE
// ============================================
// Middleware to check if the authenticated user is an owner or member of a vendor.
// Used for operations that allow both owners and members (e.g., managing listings).

import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database.config.js";
import { ApiResponse } from "../models/apiResponse.model.js";
import User from "../models/User.model.js";

/**
 * Checks if the authenticated user is an owner or member of the vendor
 * @param req - Express request object (expects listing ID in params)
 * @param res - Express response object
 * @param next - Express next function
 * @description Verifies that the current user is either an owner or member of the vendor
 */
export const checkVendorAccess = async (
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

        // Validate listing ID
        if (!id) {
            res.api(ApiResponse.error(400, "Listing ID is required", "missing_listing_id"));
            return;
        }

        // Fetch listing with vendor ownership/membership info
        const listing = await prisma.listing.findUnique({
            where: { id },
            include: {
                vendor: {
                    include: {
                        owners: {
                            where: { email: user.email }
                        },
                        members: {
                            where: { email: user.email }
                        }
                    }
                }
            }
        });

        if (!listing) {
            res.api(ApiResponse.error(404, "Listing not found", "listing_not_found"));
            return;
        }

        // Check if user is owner or member
        const isOwner = listing.vendor.owners.length > 0;
        const isMember = listing.vendor.members.length > 0;

        if (!isOwner && !isMember) {
            res.api(
                ApiResponse.error(
                    403,
                    "Forbidden: You are not authorized to perform this action. Only vendor owners and members can make changes.",
                    "not_vendor_member_or_owner"
                )
            );
            return;
        }

        // User is authorized, proceed to next middleware/controller
        next();
    } catch (error) {
        console.error("Error checking vendor access:", error);
        res.api(ApiResponse.error(500, "Error checking vendor access", "server_error"));
    }
};

// Default export for backward compatibility
export default checkVendorAccess;
