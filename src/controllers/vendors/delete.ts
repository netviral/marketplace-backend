// ============================================
// VENDORS - DELETE OPERATIONS
// ============================================

import { Request, Response } from "express";
import { prisma } from "../../config/database.config.js";
import { ApiResponse } from "../../models/apiResponse.model.js";

/**
 * Delete vendor
 * @route DELETE /vendors/me/:id
 * @access Private - Owner only (checked by middleware)
 */
export const deleteVendor = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id) {
            res.api(ApiResponse.error(400, "Vendor ID is required", "missing_vendor_id"));
            return;
        }

        await prisma.vendor.delete({
            where: { id }
        });

        res.api(ApiResponse.success(200, "Vendor deleted successfully", null));
    } catch (error) {
        console.error("Error deleting vendor:", error);
        res.api(ApiResponse.error(500, "Error deleting vendor", error));
    }
};
