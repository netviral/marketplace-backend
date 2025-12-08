/// <reference path="../../types/express.d.ts" />
import { Request, Response } from "express";
import { prisma } from "../../config/database.config.js";
import { ApiResponse } from "../../models/apiResponse.model.js";
import User from "../../models/User.model.js";
import { NotificationService } from "../../services/NotificationService.js";

export const createReview = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = req.user as User | undefined;
        const { listingId, rating, comments } = req.body;

        if (!user || !user.id) {
            res.api(ApiResponse.error(401, "Unauthorized", "unauthorized"));
            return;
        }

        if (!listingId) {
            res.api(ApiResponse.error(400, "Listing ID is required", "missing_listing_id"));
            return;
        }

        if (rating === undefined || typeof rating !== 'number' || rating < 1 || rating > 5) {
            res.api(ApiResponse.error(400, "Rating must be an integer between 1 and 5", "invalid_rating"));
            return;
        }

        // Check if listing exists? (Prisma connect throws if not found)

        try {
            const review = await prisma.review.create({
                data: {
                    userId: user.id,
                    listingId,
                    rating,
                    comments: comments || ""
                }
            });

            // Notify
            NotificationService.sendReviewSubmitted(review.id).catch(console.error);

            res.api(ApiResponse.success(201, "Review posted successfully", review));
        } catch (e: any) {
            if (e.code === 'P2002') { // Unique constraint violation
                res.api(ApiResponse.error(409, "You have already reviewed this listing. You can edit your existing review.", "review_exists"));
                return;
            }
            if (e.code === 'P2025') { // record required but not found
                res.api(ApiResponse.error(404, "Listing not found", "listing_not_found"));
                return;
            }
            throw e;
        }

    } catch (error) {
        console.error("Error creating review:", error);
        res.api(ApiResponse.error(500, "Error creating review", error));
    }
};
