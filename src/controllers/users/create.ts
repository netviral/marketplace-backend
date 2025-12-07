/// <reference path="../../types/express.d.ts" />
// ============================================
// USERS - CREATE OPERATIONS
// ============================================

import { Request, Response } from "express";
import { ApiResponse } from "../../models/apiResponse.model.js";
import UserService from "../../services/UserService.js";

/**
 * Create a new user (Admin)
 * @route POST /users
 * @access Private - Admin only
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        let { name, email, roles, imageUrl } = req.body;

        // Parse roles if it's a string
        if (typeof roles === 'string') {
            try {
                roles = JSON.parse(roles);
            } catch (e) {
                // If parsing fails, maybe it's a single role string
                roles = [roles];
            }
        }

        if (!imageUrl) imageUrl = "";

        const user = await UserService.registerUser(name, email, imageUrl, roles);
        res.api(ApiResponse.success(201, "User created successfully", user));
    } catch (error: any) {
        console.error("Error creating user:", error);
        res.api(ApiResponse.error(400, "Failed to create user", error.message)); // Use error.message for validation errors
    }
};
