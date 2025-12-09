/// <reference path="../../types/express.d.ts" />
// ============================================
// VENDORS - UPDATE OPERATIONS
// ============================================

import { Request, Response } from "express";
import { prisma } from "../../config/database.config.js";
import { ApiResponse } from "../../models/apiResponse.model.js";
import { S3Service } from "../../services/S3Service.js";

/**
 * Update vendor information
 * @route PUT /vendors/me/:id
 * @access Private - Owner only (checked by middleware)
 */
export const updateVendor = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, description, contactEmail, contactPhone, categories, logo, paymentInformation, upiId, memberEmails } = req.body;

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

        // Validate memberEmails if provided
        if (memberEmails !== undefined && !Array.isArray(memberEmails)) {
            res.api(ApiResponse.error(400, "Validation error: 'memberEmails' must be an array", "invalid_member_emails"));
            return;
        }

        // Build update data
        const updateData: Record<string, unknown> = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
        if (contactPhone !== undefined) updateData.contactPhone = contactPhone;
        if (categories !== undefined) updateData.categories = categories;

        // Handle Logo Upload
        if (logo !== undefined) {
            try {
                updateData.logo = await S3Service.uploadImage(logo, 'vendors');
            } catch (error) {
                console.error("Logo upload failed", error);
                res.api(ApiResponse.error(500, "Failed to upload logo", error));
                return;
            }
        }

        if (paymentInformation !== undefined) updateData.paymentInformation = paymentInformation;
        if (upiId !== undefined) updateData.upiId = upiId;

        // Handle member updates
        if (memberEmails !== undefined && Array.isArray(memberEmails)) {
            // Filter out empty strings and duplicates
            const validEmails = [...new Set(memberEmails.filter((email: string) => email && email.trim()))];

            if (validEmails.length > 0) {
                // Verify all member emails exist in the database
                const existingUsers = await prisma.user.findMany({
                    where: {
                        email: { in: validEmails }
                    },
                    select: { email: true }
                });

                const existingEmails = existingUsers.map(u => u.email);
                const missingEmails = validEmails.filter((email: string) => !existingEmails.includes(email));

                if (missingEmails.length > 0) {
                    res.api(ApiResponse.error(400, `The following member emails do not exist: ${missingEmails.join(', ')}`, "invalid_member_emails"));
                    return;
                }

                // Replace all members with new list
                updateData.members = {
                    set: validEmails.map((email: string) => ({ email }))
                };
            } else {
                // Empty array means remove all members
                updateData.members = {
                    set: []
                };
            }
        }

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
                },
                members: {
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
