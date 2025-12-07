/// <reference path="../../types/express.d.ts" />
// ============================================
// LISTINGS - CREATE OPERATIONS
// ============================================

import { Request, Response } from "express";
import { prisma } from "../../config/database.config.js";
import { ApiResponse } from "../../models/apiResponse.model.js";
import User from "../../models/User.model.js";

/**
 * Create a new listing for a vendor
 * @route POST /vendors/:vendorId/listings
 * @access Private - Vendor owner or member only
 */
export const createListing = async (req: Request, res: Response): Promise<void> => {
    try {
        const { vendorId } = req.params;
        const {
            name,
            description,
            type,
            inventoryType,
            images = [],
            availableQty,
            isAvailable,
            price,
            variants = [],
            tags = []
        } = req.body;
        const user = req.user as User | undefined;

        // Check authentication
        if (!user || !user.email) {
            res.api(ApiResponse.error(401, "Unauthorized: No user information found", "unauthorized"));
            return;
        }

        if (!vendorId) {
            res.api(ApiResponse.error(400, "Vendor ID is required", "missing_vendor_id"));
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

        if (!type || !['PRODUCT', 'SERVICE'].includes(type)) {
            res.api(ApiResponse.error(400, "Validation error: 'type' is required and must be either 'PRODUCT' or 'SERVICE'", "invalid_type"));
            return;
        }

        if (!inventoryType || !['STOCK', 'ON_DEMAND'].includes(inventoryType)) {
            res.api(ApiResponse.error(400, "Validation error: 'inventoryType' is required and must be either 'STOCK' or 'ON_DEMAND'", "invalid_inventory_type"));
            return;
        }

        // Check if user is owner or member of the vendor
        const vendor = await prisma.vendor.findUnique({
            where: { id: vendorId },
            include: {
                owners: { where: { email: user.email } },
                members: { where: { email: user.email } }
            }
        });

        if (!vendor) {
            res.api(ApiResponse.error(404, "Vendor not found", "vendor_not_found"));
            return;
        }

        const isOwner = vendor.owners.length > 0;
        const isMember = vendor.members.length > 0;

        if (!isOwner && !isMember) {
            res.api(ApiResponse.error(403, "Forbidden: You must be an owner or member of the vendor to create listings", "not_vendor_member_or_owner"));
            return;
        }

        // Build listing data
        const listingData: Record<string, unknown> = {
            name,
            description,
            type,
            inventoryType,
            vendorId,
            images,
            availableQty,
            isAvailable,
            price,
            variants
        };

        // Add tags if provided
        if (tags.length > 0) {
            listingData.tags = {
                connectOrCreate: tags.map((tagName: string) => ({
                    where: { name: tagName },
                    create: { name: tagName }
                }))
            };
        }

        const listing = await prisma.listing.create({
            data: listingData as any,
            include: {
                vendor: {
                    select: {
                        id: true,
                        name: true,
                        logo: true
                    }
                },
                tags: true
            }
        });

        res.api(ApiResponse.success(201, "Listing created successfully", listing));
    } catch (error) {
        console.error("Error creating listing:", error);
        res.api(ApiResponse.error(500, "Error creating listing", "server_error"));
    }
};
