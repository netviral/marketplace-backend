/// <reference path="../../types/express.d.ts" />
import { Request, Response } from "express";
import { prisma } from "../../config/database.config.js";
import { ApiResponse } from "../../models/apiResponse.model.js";
import User from "../../models/User.model.js";

export const updateReview = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const user = req.user as User | undefined;
        const { rating, comments } = req.body;

        if (!user || !user.id) {
            res.api(ApiResponse.error(401, "Unauthorized", "unauthorized"));
            return;
        }

        if (!id) {
            res.api(ApiResponse.error(400, "Review ID is required", "missing_id"));
            return;
        }

        // Verify ownership
        const existing = await prisma.review.findUnique({ where: { id } });
        if (!existing) {
            res.api(ApiResponse.error(404, "Review not found", "not_found"));
            return;
        }

        if (existing.userId !== user.id) {
            res.api(ApiResponse.error(403, "You can only edit your own reviews", "forbidden"));
            return;
        }

        const data: any = {};
        if (rating !== undefined) data.rating = rating;
        if (comments !== undefined) data.comments = comments;

        const updated = await prisma.review.update({
            where: { id },
            data
        });

        res.api(ApiResponse.success(200, "Review updated successfully", updated));
    } catch (error) {
        console.error("Error updating review:", error);
        res.api(ApiResponse.error(500, "Error updating review", error));
    }
};
