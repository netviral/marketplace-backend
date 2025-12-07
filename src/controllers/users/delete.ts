/// <reference path="../../types/express.d.ts" />
// ============================================
// USERS - DELETE OPERATIONS
// ============================================

import { Request, Response } from "express";
import { ApiResponse } from "../../models/apiResponse.model.js";
import UserService from "../../services/UserService.js";

/**
 * Delete user by ID (Admin)
 * @route DELETE /users/:id
 * @access Private - Admin only
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id) {
            res.api(ApiResponse.error(400, "User ID is required", "missing_user_id"));
            return;
        }

        // Check if user exists first? (Optional, delete throws if not found typically or passes silent)
        // Prisma delete throws 'Record to delete does not exist.' if not found.

        try {
            await UserService.deleteUser(id);
        } catch (e: any) {
            if (e.code === 'P2025') {
                res.api(ApiResponse.error(404, "User not found", "user_not_found"));
                return;
            }
            throw e;
        }

        res.api(ApiResponse.success(200, "User deleted successfully", null));
    } catch (error) {
        console.error("Error deleting user:", error);
        res.api(ApiResponse.error(500, "Error deleting user", error));
    }
};
