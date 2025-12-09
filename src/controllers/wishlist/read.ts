/// <reference path="../../types/express.d.ts" />
// ============================================
// WISHLIST - READ OPERATIONS
// ============================================

import { Request, Response } from "express";
import { prisma } from "../../config/database.config.js";
import { ApiResponse } from "../../models/apiResponse.model.js";
import User from "../../models/User.model.js";

/**
 * Get current user's wishlist
 * @route GET /wishlist/me
 * @access Private - Authenticated users only
 */
export const getMyWishlist = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = req.user as User | undefined;

        if (!user || !user.id) {
            res.api(ApiResponse.error(401, "Unauthorized", "unauthorized"));
            return;
        }

        // Direct query to get user's wishlist
        const wishlistItems = await prisma.listing.findMany({
            where: {
                wishlistedBy: {
                    some: {
                        id: user.id
                    }
                }
            },
            include: {
                vendor: true,
                tags: true,
                reviews: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Return in QueryService format for consistency
        const result = {
            data: wishlistItems,
            meta: {
                total: wishlistItems.length,
                page: 1,
                limit: wishlistItems.length,
                totalPages: 1
            }
        };

        res.api(ApiResponse.success(200, "Wishlist fetched successfully", result));
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        res.api(ApiResponse.error(500, "Error fetching wishlist", error));
    }
};
