import { Request, Response } from "express";
import { prisma } from "../../config/database.config.js";
import { ApiResponse } from "../../models/apiResponse.model.js";

// Get all vendors with pending status
export async function getPendingVendors(req: Request, res: Response) {
    try {
        const pendingVendors = await prisma.vendor.findMany({
            where: { isVerified: false },
            include: {
                owners: true,
                members: true,
                listings: true
            }
        });
    res.api(ApiResponse.success(200, "Pending vendors fetched successfully", pendingVendors));
    } catch (error) {
        console.error("Error fetching pending vendors:", error);
        res.api(ApiResponse.error(500, "Error fetching pending vendors", "server_error"));
    }
}

// Update vendor status
export async function updateVendorStatus(req: Request, res: Response) {
    try {
        const vendorId = req.params.id;
        const { isVerified } = req.body;
        if (typeof isVerified !== "boolean") {
            res.api(ApiResponse.error(400, "isVerified must be a boolean", "bad_request"));
            return;
        }
        if (!vendorId || typeof vendorId !== "string") {
            res.api(ApiResponse.error(400, "Vendor ID is required", "bad_request"));
            return;
        }
        const updatedVendor = await prisma.vendor.update({
            where: { id: vendorId },
            data: { isVerified },
        });
        res.api(ApiResponse.success(200, "Vendor status updated successfully", updatedVendor));
    } catch (error) {
        console.error("Error updating vendor status:", error);
        res.api(ApiResponse.error(500, "Error updating vendor status", "server_error"));
    }
}
