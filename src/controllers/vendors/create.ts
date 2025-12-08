/// <reference path="../../types/express.d.ts" />
// ============================================
// VENDORS - CREATE OPERATIONS
// ============================================

import { Request, Response } from "express";
import { prisma } from "../../config/database.config.js";
import { ApiResponse } from "../../models/apiResponse.model.js";
import User from "../../models/User.model.js";
import { S3Service } from "../../services/S3Service.js";

/**
 * Create a new vendor
 * @route POST /vendors/me
 * @access Private - Authenticated users only
 */
export const createVendor = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description, contactEmail, contactPhone, categories, logo, paymentInformation, upiId } = req.body;
        const user = req.user as User | undefined;

        // Check authentication
        if (!user || !user.email) {
            res.api(ApiResponse.error(401, "Unauthorized: No user information found", "unauthorized"));
            return;
        }

        // Validate required fields
        if (!name || typeof name !== 'string' || name.trim() === '') {
            res.api(ApiResponse.error(400, "Validation error: 'name' is required and must be a non-empty string", "invalid_name"));
            return;
        }

        if (!description || typeof description !== 'string' || description.trim() === '') {
            res.api(ApiResponse.error(400, "Validation error: 'description' is required and must be a non-empty string", "invalid_description"));
            return;
        }

        if (!contactEmail || typeof contactEmail !== 'string' || contactEmail.trim() === '') {
            res.api(ApiResponse.error(400, "Validation error: 'contactEmail' is required and must be a non-empty string", "invalid_contact_email"));
            return;
        }

        if (!contactPhone || typeof contactPhone !== 'string' || contactPhone.trim() === '') {
            res.api(ApiResponse.error(400, "Validation error: 'contactPhone' is required and must be a non-empty string", "invalid_contact_phone"));
            return;
        }

        if (!categories || !Array.isArray(categories) || categories.length === 0) {
            res.api(ApiResponse.error(400, "Validation error: 'categories' is required and must be a non-empty array", "invalid_categories"));
            return;
        }

        // Process Logo Upload
        let logoUrl = logo;
        if (logo) {
            try {
                logoUrl = await S3Service.uploadImage(logo, 'vendors');
            } catch (error) {
                console.error("Logo upload failed:", error);
                // Proceed without logo or fail? 
                // Usually better to fail or warn.
                // Assuming fail for now to ensure consistency.
                res.api(ApiResponse.error(500, "Failed to upload logo image", error));
                return;
            }
        }

        // Create vendor with current user as owner
        const vendor = await prisma.vendor.create({
            data: {
                name,
                description,
                contactEmail,
                contactPhone,
                categories,
                logo: logoUrl, // Use processed URL
                paymentInformation,
                upiId,
                owners: {
                    connect: { email: user.email }
                }
            },
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

        res.api(ApiResponse.success(201, "Vendor created successfully", vendor));
    } catch (error) {
        console.error("Error creating vendor:", error);
        res.api(ApiResponse.error(500, "Error creating vendor", error));
    }
};
