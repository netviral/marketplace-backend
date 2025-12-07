/// <reference path="../../types/express.d.ts" />
// ============================================
// WISHLIST - READ OPERATIONS
// ============================================

import { Request, Response } from "express";
import { prisma } from "../../config/database.config.js";
import { ApiResponse } from "../../models/apiResponse.model.js";
import User from "../../models/User.model.js";
import { QueryService } from "../../services/QueryService.js";

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

        // Use QueryService to fetch listings with pagination/search/sort
        // Filter: Listings where 'wishlistedBy' includes the current user
        req.query.additionalWhere = {
            wishlistedBy: {
                some: {
                    id: user.id
                }
            }
        };

        const result = await QueryService.query(prisma.listing, req.query, {
            searchFields: ['name', 'description'],
            allowedFilters: ['type', 'isAvailable'], // Allow filtering within wishlist
            defaultSort: 'createdAt:desc',
            include: {
                vendor: true, // Likely want to see vendor info
                tags: true
            }
        });

        res.api(ApiResponse.success(200, "Wishlist fetched successfully", result));
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        res.api(ApiResponse.error(500, "Error fetching wishlist", error));
    }
};
