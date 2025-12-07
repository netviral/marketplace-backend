/// <reference path="../../types/express.d.ts" />
// ============================================
// USERS - READ OPERATIONS
// ============================================

import { Request, Response } from "express";
import { ApiResponse } from "../../models/apiResponse.model.js";
import User from "../../models/User.model.js";
import UserService from "../../services/UserService.js";

/**
 * Get current user profile
 * @route GET /users/me
 * @access Private - Authenticated users only
 */
export const getMyProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = req.user as User | undefined;

        if (!user || !user.email) {
            res.api(ApiResponse.error(401, "Unauthorized: No user information found", "unauthorized"));
            return;
        }

        res.api(ApiResponse.success(200, "User profile fetched successfully", user));
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.api(ApiResponse.error(500, "Error fetching user profile", error));
    }
};

/**
 * Get user by ID
 * @route GET /users/:id
 * @access Private
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id) {
            res.api(ApiResponse.error(400, "User ID is required", "missing_user_id"));
            return;
        }

        const user = await UserService.getUserById(id);

        if (!user) {
            res.api(ApiResponse.error(404, "User not found", "user_not_found"));
            return;
        }

        res.api(ApiResponse.success(200, "User fetched successfully", user));
    } catch (error) {
        console.error("Error fetching user:", error);
        res.api(ApiResponse.error(500, "Error fetching user", error));
    }
};
