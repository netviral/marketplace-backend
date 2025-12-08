/// <reference path="../../types/express.d.ts" />
import { Request, Response } from "express";
import { prisma } from "../../config/database.config.js";
import { ApiResponse } from "../../models/apiResponse.model.js";
import User from "../../models/User.model.js";
import { QueryService } from "../../services/QueryService.js";

/**
 * Get reviews (filter by listingId via query)
 * @route GET /reviews?listingId=...
 * @access Public
 */
export const getReviews = async (req: Request, res: Response): Promise<void> => {
    try {
        const { listingId } = req.query;
        // If listingId is provided, strict filter.
        // Or use QueryService for general purpose.

        // Let's use QueryService on Review model.
        // If listingId is passed, standard QueryService handles mapping?
        // QueryService maps 'listingId' if in AllowedFilters?
        // Or we pass additionalWhere manually.

        const additionalWhere: any = {};
        if (listingId) {
            additionalWhere.listingId = listingId;
        }

        req.query.additionalWhere = additionalWhere;

        const result = await QueryService.query(prisma.review, req.query, {
            searchFields: ['comments'], // Search in comments
            allowedFilters: ['listingId', 'rating', 'userId'],
            defaultSort: 'createdAt:desc',
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        imageUrl: true
                    }
                }
            }
        });

        res.api(ApiResponse.success(200, "Reviews fetched successfully", result));
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.api(ApiResponse.error(500, "Error fetching reviews", error));
    }
};

/**
 * Get my reviews
 * @route GET /reviews/me
 * @access Private
 */
export const getMyReviews = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = req.user as User | undefined;
        if (!user || !user.id) {
            res.api(ApiResponse.error(401, "Unauthorized", "unauthorized"));
            return;
        }

        req.query.additionalWhere = { userId: user.id };

        const result = await QueryService.query(prisma.review, req.query, {
            searchFields: ['comments'],
            allowedFilters: ['rating', 'listingId'],
            defaultSort: 'createdAt:desc',
            include: {
                listing: {
                    select: {
                        id: true,
                        name: true,
                        images: true, // Show product image
                        vendorId: true
                    }
                }
            }
        });

        res.api(ApiResponse.success(200, "My reviews fetched successfully", result));

    } catch (error) {
        console.error("Error fetching my reviews:", error);
        res.api(ApiResponse.error(500, "Error fetching my reviews", error));
    }
};
