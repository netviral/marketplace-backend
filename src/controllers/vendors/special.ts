/// <reference path="../../types/express.d.ts" />
// ============================================
// VENDORS - SPECIAL OPERATIONS
// ============================================

import { Request, Response } from "express";
import { prisma } from "../../config/database.config.js";
import { ApiResponse } from "../../models/apiResponse.model.js";

/**
 * Verify vendor (admin only)
 * @route POST /vendors/:id/verify
 * @access Private - Admin only (checked by middleware)
 */
export const verifyVendor = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id) {
            res.api(ApiResponse.error(400, "Vendor ID is required", "missing_vendor_id"));
            return;
        }

        const vendor = await prisma.vendor.update({
            where: { id },
            data: { isVerified: true },
            select: {
                id: true,
                name: true,
                isVerified: true
            }
        });

        res.api(ApiResponse.success(200, "Vendor verified successfully", vendor));
    } catch (error) {
        console.error("Error verifying vendor:", error);
        res.api(ApiResponse.error(500, "Error verifying vendor", "server_error"));
    }
};
