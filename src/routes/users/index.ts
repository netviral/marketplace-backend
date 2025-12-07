/// <reference path="../../types/express.d.ts" />
// ============================================
// USERS ROUTES
// ============================================
// This file defines all user-related routes.
// 
// Base path: /users (mounted in main routes/index.ts)

import express, { Request, Response } from "express";
import UserService from "../../services/UserService.js";
import { ApiResponse } from "../../models/apiResponse.model.js";
import User from "../../models/User.model.js";

// ============================================
// ROUTER SETUP
// ============================================

const router = express.Router();

// ============================================
// CREATE OPERATIONS
// ============================================

/**
 * Create a new user
 * @route POST /users
 * @access Private - Admin only (should add middleware)
 * @description Creates a new user with specified roles
 */
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    let { name, email, roles } = req.body;

    // Parse roles if it's a string
    if (typeof roles === 'string') {
      roles = JSON.parse(roles);
    }

    const user = await UserService.registerUser(name, email, roles);
    res.api(ApiResponse.success(201, "User created successfully", user));
  } catch (err: any) {
    console.error("Error creating user:", err);
    res.api(ApiResponse.error(400, "Failed to create user", err.message));
  }
});

// ============================================
// READ OPERATIONS
// ============================================

/**
 * Get current user profile
 * @route GET /users/me
 * @access Private - Authenticated users only
 * @description Returns the profile of the currently logged-in user
 */
router.get("/me", async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as User | undefined;

    if (!user || !user.email) {
      res.api(ApiResponse.error(401, "Unauthorized: No user information found", "unauthorized"));
      return;
    }

    // Return user data (password and sensitive info should be excluded)
    res.api(ApiResponse.success(200, "User profile fetched successfully", user));
  } catch (err: any) {
    console.error("Error fetching user profile:", err);
    res.api(ApiResponse.error(500, "Failed to fetch user profile", "server_error"));
  }
});

/**
 * Get user by ID
 * @route GET /users/:id
 * @access Public
 * @description Returns public profile information for a specific user
 */
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.api(ApiResponse.error(400, "User ID is required", "missing_user_id"));
      return;
    }

    // TODO: Implement getUserById in UserService
    // const user = await UserService.getUserById(id);

    // Temporary response
    res.api(ApiResponse.error(404, "User not found", "user_not_found"));
  } catch (err: any) {
    console.error("Error fetching user:", err);
    res.api(ApiResponse.error(500, "Failed to fetch user", "server_error"));
  }
});

// ============================================
// UPDATE OPERATIONS
// ============================================

/**
 * Update current user profile
 * @route PUT /users/me
 * @access Private - Authenticated users only
 * @description Updates the profile of the currently logged-in user
 */
router.put("/me", async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as User | undefined;
    const { name, phone, address, imageUrl } = req.body;

    if (!user || !user.id) {
      res.api(ApiResponse.error(401, "Unauthorized: No user information found", "unauthorized"));
      return;
    }

    // TODO: Implement updateUser in UserService
    // const updatedUser = await UserService.updateUser(user.id, { name, phone, address, imageUrl });

    // Temporary response
    res.api(ApiResponse.success(200, "User profile updated successfully", { name, phone, address, imageUrl }));
  } catch (err: any) {
    console.error("Error updating user:", err);
    res.api(ApiResponse.error(500, "Failed to update user", "server_error"));
  }
});

/**
 * Update user by ID
 * @route PUT /users/:id
 * @access Private - Admin only (should add middleware)
 * @description Updates a user's information (admin operation)
 */
router.put("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, roles } = req.body;

    if (!id) {
      res.api(ApiResponse.error(400, "User ID is required", "missing_user_id"));
      return;
    }

    // TODO: Implement updateUser in UserService
    // const user = await UserService.updateUser(id, { name, roles });

    // Temporary response
    res.api(ApiResponse.success(200, "User updated successfully", { name, roles }));
  } catch (err: any) {
    console.error("Error updating user:", err);
    res.api(ApiResponse.error(500, "Failed to update user", "server_error"));
  }
});

// ============================================
// DELETE OPERATIONS
// ============================================

/**
 * Delete user by ID
 * @route DELETE /users/:id
 * @access Private - Admin only (should add middleware)
 * @description Permanently deletes a user account
 */
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.api(ApiResponse.error(400, "User ID is required", "missing_user_id"));
      return;
    }

    // TODO: Implement deleteUser in UserService
    // await UserService.deleteUser(id);

    // Temporary response
    res.api(ApiResponse.success(200, "User deleted successfully", null));
  } catch (err: any) {
    console.error("Error deleting user:", err);
    res.api(ApiResponse.error(500, "Failed to delete user", "server_error"));
  }
});

// ============================================
// EXPORT
// ============================================

export default router;
