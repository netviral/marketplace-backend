/// <reference path="../../types/express.d.ts" />
// ============================================
// USERS ROUTES
// ============================================
// This file defines all user-related routes.
// 
// Base path: /users (mounted in main routes/index.ts)

import express from "express";
import * as UsersController from "../../controllers/users/index.js";

// ============================================
// ROUTER SETUP
// ============================================

const router = express.Router();

// ============================================
// PROFILE OPERATIONS (Must be before /:id)
// ============================================

/**
 * Get current user profile
 * @route GET /users/me
 * @access Private - Authenticated users only
 */
router.get("/me", UsersController.getMyProfile);

/**
 * Update current user profile
 * @route PUT /users/me
 * @access Private - Authenticated users only
 */
router.put("/me", UsersController.updateMyProfile);

// ============================================
// ADMIN / GENERIC OPERATIONS
// ============================================

/**
 * Create a new user (Admin)
 * @route POST /users
 * @access Private - Admin only
 */
router.post("/", UsersController.createUser);

/**
 * Get user by ID
 * @route GET /users/:id
 * @access Private
 */
router.get("/:id", UsersController.getUserById);

/**
 * Update user by ID (Admin)
 * @route PUT /users/:id
 * @access Private - Admin only
 */
router.put("/:id", UsersController.updateUserById);

/**
 * Delete user by ID (Admin)
 * @route DELETE /users/:id
 * @access Private - Admin only
 */
router.delete("/:id", UsersController.deleteUser);

// ============================================
// EXPORT
// ============================================

export default router;
