/// <reference path="../../types/express.d.ts" />
import { Request, Response } from "express";
import { prisma } from "../../config/database.config.js";
import { ApiResponse } from "../../models/apiResponse.model.js";
import User from "../../models/User.model.js";

export const deleteReview = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const user = req.user as User | undefined;

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

        // Allow owner OR Admin? For now just owner.
        // User model in request usually has roles.
        const isAdmin = user.roles && user.roles.includes('admin');

        if (existing.userId !== user.id && !isAdmin) {
            res.api(ApiResponse.error(403, "You can only delete your own reviews", "forbidden"));
            return;
        }

        await prisma.review.delete({ where: { id } });

        res.api(ApiResponse.success(200, "Review deleted successfully", null));
    } catch (error) {
        console.error("Error deleting review:", error);
        res.api(ApiResponse.error(500, "Error deleting review", error));
    }
};
