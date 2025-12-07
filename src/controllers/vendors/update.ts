/// <reference path="../../types/express.d.ts" />
// ============================================
// VENDORS - UPDATE OPERATIONS
// ============================================

import { Request, Response } from "express";
import { prisma } from "../../config/database.config.js";
import { ApiResponse } from "../../models/apiResponse.model.js";

/**
 * Update vendor information
 * @route PUT /vendors/me/:id
 * @access Private - Owner only (checked by middleware)
 */
export const updateVendor = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, description, contactEmail, contactPhone, categories, logo, paymentInformation, upiId } = req.body;

        if (!id) {
            res.api(ApiResponse.error(400, "Vendor ID is required", "missing_vendor_id"));
            return;
        }

        // Validate fields if provided (only validate non-empty values)
        if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
            res.api(ApiResponse.error(400, "Validation error: 'name' must be a non-empty string", "invalid_name"));
            return;
        }

        if (description !== undefined && (typeof description !== 'string' || description.trim() === '')) {
            res.api(ApiResponse.error(400, "Validation error: 'description' must be a non-empty string", "invalid_description"));
            return;
        }

        if (contactEmail !== undefined && (typeof contactEmail !== 'string' || contactEmail.trim() === '')) {
            res.api(ApiResponse.error(400, "Validation error: 'contactEmail' must be a non-empty string", "invalid_contact_email"));
            return;
        }

        if (contactPhone !== undefined && (typeof contactPhone !== 'string' || contactPhone.trim() === '')) {
            res.api(ApiResponse.error(400, "Validation error: 'contactPhone' must be a non-empty string", "invalid_contact_phone"));
            return;
        }

        if (categories !== undefined && (!Array.isArray(categories) || categories.length === 0)) {
            res.api(ApiResponse.error(400, "Validation error: 'categories' must be a non-empty array", "invalid_categories"));
            return;
        }

        // Build update data
        const updateData: Record<string, unknown> = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
        if (contactPhone !== undefined) updateData.contactPhone = contactPhone;
        if (categories !== undefined) updateData.categories = categories;
        if (logo !== undefined) updateData.logo = logo;
        if (paymentInformation !== undefined) updateData.paymentInformation = paymentInformation;
        if (upiId !== undefined) updateData.upiId = upiId;

        const vendor = await prisma.vendor.update({
            where: { id },
            data: updateData as any,
            include: {
                owners: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        res.api(ApiResponse.success(200, "Vendor updated successfully", vendor));
    } catch (error) {
        console.error("Error updating vendor:", error);
        res.api(ApiResponse.error(500, "Error updating vendor", error));
    }
};
