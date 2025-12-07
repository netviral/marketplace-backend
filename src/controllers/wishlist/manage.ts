/// <reference path="../../types/express.d.ts" />
// ============================================
// WISHLIST - MANAGE OPERATIONS
// ============================================

import { Request, Response } from "express";
import { prisma } from "../../config/database.config.js";
import { ApiResponse } from "../../models/apiResponse.model.js";
import User from "../../models/User.model.js";

/**
 * Add a listing to wishlist
 * @route POST /wishlist/:listingId
 * @access Private
 */
export const addToWishlist = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = req.user as User | undefined;
        const { listingId } = req.params;

        if (!user || !user.id) {
            res.api(ApiResponse.error(401, "Unauthorized", "unauthorized"));
            return;
        }

        if (!listingId) {
            res.api(ApiResponse.error(400, "Listing ID is required", "missing_listing_id"));
            return;
        }

        // Check availability? (Optional: you can wishlist OOS items)

        await prisma.user.update({
            where: { id: user.id },
            data: {
                wishlist: {
                    connect: { id: listingId }
                }
            }
        });

        res.api(ApiResponse.success(200, "Added to wishlist", null));
    } catch (error: any) {
        if (error.code === 'P2025') {
            res.api(ApiResponse.error(404, "Listing not found", "listing_not_found"));
            return;
        }
        console.error("Error adding to wishlist:", error);
        res.api(ApiResponse.error(500, "Error adding to wishlist", error));
    }
};

/**
 * Remove a listing from wishlist
 * @route DELETE /wishlist/:listingId
 * @access Private
 */
export const removeFromWishlist = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = req.user as User | undefined;
        const { listingId } = req.params;

        if (!user || !user.id) {
            res.api(ApiResponse.error(401, "Unauthorized", "unauthorized"));
            return;
        }

        if (!listingId) {
            res.api(ApiResponse.error(400, "Listing ID is required", "missing_listing_id"));
            return;
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                wishlist: {
                    disconnect: { id: listingId }
                }
            }
        });

        res.api(ApiResponse.success(200, "Removed from wishlist", null));
    } catch (error: any) {
        if (error.code === 'P2025') {
            // Listing might not be in wishlist or not exist. Treat as success or 404?
            // If disconnect fails because not connected, strictly it implies state is already what we want?
            // Prisma disconnect throws if record connect doesn't exist? No, disconnect allows idempotent?
            // Actually P2025 usually happens if the PARENT (User) doesn't exist (unlikely) or child not found.
            // If child not found, it throws.
            res.api(ApiResponse.error(404, "Listing not found or not in wishlist", "not_found"));
            return;
        }
        console.error("Error removing from wishlist:", error);
        res.api(ApiResponse.error(500, "Error removing from wishlist", error));
    }
};
