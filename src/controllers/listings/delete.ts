/// <reference path="../../types/express.d.ts" />
// ============================================
// LISTINGS - DELETE OPERATIONS
// ============================================

import { Request, Response } from "express";
import { prisma } from "../../config/database.config.js";
import { ApiResponse } from "../../models/apiResponse.model.js";

/**
 * Delete listing
 * @route DELETE /vendors/:vendorId/listings/:id
 * @access Private - Vendor owner or member only (checked by middleware)
 */
export const deleteListing = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id) {
            res.api(ApiResponse.error(400, "Listing ID is required", "missing_listing_id"));
            return;
        }

        await prisma.listing.delete({
            where: { id }
        });

        res.api(ApiResponse.success(200, "Listing deleted successfully", null));
    } catch (error) {
        console.error("Error deleting listing:", error);
        res.api(ApiResponse.error(500, "Error deleting listing", error));
    }
};
