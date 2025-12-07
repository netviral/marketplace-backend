/// <reference path="../../types/express.d.ts" />
// ============================================
// USERS - UPDATE OPERATIONS
// ============================================

import { Request, Response } from "express";
import { ApiResponse } from "../../models/apiResponse.model.js";
import User from "../../models/User.model.js";
import UserService from "../../services/UserService.js";

/**
 * Update current user profile
 * @route PUT /users/me
 * @access Private - Authenticated users only
 */
export const updateMyProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = req.user as User | undefined;
        const { name, phone, address, imageUrl } = req.body;

        if (!user || !user.id) {
            res.api(ApiResponse.error(401, "Unauthorized: No user information found", "unauthorized"));
            return;
        }

        const updatedUser = await UserService.updateUserProfile(user.id, { name, phone, address, imageUrl });

        if (!updatedUser) {
            res.api(ApiResponse.error(500, "Failed to update profile", "update_failed"));
            return;
        }

        res.api(ApiResponse.success(200, "User profile updated successfully", updatedUser));
    } catch (error) {
        console.error("Error updating profile:", error);
        res.api(ApiResponse.error(500, "Error updating profile", error));
    }
};

/**
 * Update user by ID (Admin)
 * @route PUT /users/:id
 * @access Private - Admin only
 */
export const updateUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, roles, isActive, isBlocked } = req.body;

        if (!id) {
            res.api(ApiResponse.error(400, "User ID is required", "missing_user_id"));
            return;
        }

        const updatedUser = await UserService.updateUserByAdmin(id, { name, roles, isActive, isBlocked });

        if (!updatedUser) {
            res.api(ApiResponse.error(404, "User not found", "user_not_found"));
            return;
        }

        res.api(ApiResponse.success(200, "User updated successfully", updatedUser));
    } catch (error) {
        console.error("Error updating user:", error);
        res.api(ApiResponse.error(500, "Error updating user", error));
    }
};
