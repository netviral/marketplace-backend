/// <reference path="../../types/express.d.ts" />
// ============================================
// LISTINGS - UPDATE OPERATIONS
// ============================================

import { Request, Response } from "express";
import { prisma } from "../../config/database.config.js";
import { ApiResponse } from "../../models/apiResponse.model.js";

/**
 * Update listing
 * @route PUT /vendors/:vendorId/listings/:id
 * @access Private - Vendor owner or member only (checked by middleware)
 */
export const updateListing = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const {
            name,
            description,
            type,
            inventoryType,
            images,
            availableQty,
            isAvailable,
            price,
            variants,
            tags
        } = req.body;

        if (!id) {
            res.api(ApiResponse.error(400, "Listing ID is required", "missing_listing_id"));
            return;
        }

        // Validate fields if provided
        if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
            res.api(ApiResponse.error(400, "Validation error: 'name' must be a non-empty string", "invalid_name"));
            return;
        }

        if (description !== undefined && (typeof description !== 'string' || description.trim() === '')) {
            res.api(ApiResponse.error(400, "Validation error: 'description' must be a non-empty string", "invalid_description"));
            return;
        }

        if (type !== undefined && !['PRODUCT', 'SERVICE'].includes(type)) {
            res.api(ApiResponse.error(400, "Validation error: 'type' must be either 'PRODUCT' or 'SERVICE'", "invalid_type"));
            return;
        }

        if (inventoryType !== undefined && !['STOCK', 'ON_DEMAND'].includes(inventoryType)) {
            res.api(ApiResponse.error(400, "Validation error: 'inventoryType' must be either 'STOCK' or 'ON_DEMAND'", "invalid_inventory_type"));
            return;
        }

        // Build update data
        const updateData: Record<string, unknown> = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (type !== undefined) updateData.type = type;
        if (inventoryType !== undefined) updateData.inventoryType = inventoryType;
        if (images !== undefined) updateData.images = images;
        if (availableQty !== undefined) updateData.availableQty = availableQty;
        if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
        if (price !== undefined) updateData.price = price;
        if (variants !== undefined) updateData.variants = variants;

        // Handle tags update
        if (tags !== undefined && Array.isArray(tags)) {
            updateData.tags = {
                set: [],
                connectOrCreate: tags.map((tagName: string) => ({
                    where: { name: tagName },
                    create: { name: tagName }
                }))
            };
        }

        const listing = await prisma.listing.update({
            where: { id },
            data: updateData as any,
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

        res.api(ApiResponse.success(200, "Listing updated successfully", listing));
    } catch (error) {
        console.error("Error updating listing:", error);
        res.api(ApiResponse.error(500, "Error updating listing", "server_error"));
    }
};
