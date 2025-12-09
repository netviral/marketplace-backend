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
        const { name, description, contactEmail, contactPhone, categories, logo, paymentInformation, upiId, memberEmails } = req.body;
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

        // Validate memberEmails if provided
        if (memberEmails !== undefined && !Array.isArray(memberEmails)) {
            res.api(ApiResponse.error(400, "Validation error: 'memberEmails' must be an array", "invalid_member_emails"));
            return;
        }

        // Process Logo Upload
        let logoUrl = logo;
        if (logo) {
            try {
                logoUrl = await S3Service.uploadImage(logo, 'vendors');
            } catch (error) {
                console.error("Logo upload failed:", error);
                res.api(ApiResponse.error(500, "Failed to upload logo image", error));
                return;
            }
        }

        // Prepare member connections
        const memberConnections = [];
        if (memberEmails && Array.isArray(memberEmails) && memberEmails.length > 0) {
            // Filter out empty strings and duplicates
            const validEmails = [...new Set(memberEmails.filter((email: string) => email && email.trim()))];

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

            memberConnections.push(...validEmails.map((email: string) => ({ email })));
        }

        // Create vendor with current user as owner and specified members
        const vendor = await prisma.vendor.create({
            data: {
                name,
                description,
                contactEmail,
                contactPhone,
                categories,
                logo: logoUrl,
                paymentInformation,
                upiId,
                owners: {
                    connect: { email: user.email }
                },
                ...(memberConnections.length > 0 && {
                    members: {
                        connect: memberConnections
                    }
                })
            },
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

        res.api(ApiResponse.success(201, "Vendor created successfully", vendor));
    } catch (error) {
        console.error("Error creating vendor:", error);
        res.api(ApiResponse.error(500, "Error creating vendor", error));
    }
};
