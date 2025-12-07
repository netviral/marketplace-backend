/// <reference path="../../types/express.d.ts" />
// ============================================
// ORDERS ROUTES
// ============================================
// This file defines user order routes.
// Vendor order routes are in vendors/index.ts
// 
// Base path: /orders (mounted in main routes/index.ts)

import express from "express";
import * as OrdersController from "../../controllers/orders/index.js";

// ============================================
// ROUTER SETUP
// ============================================

const router = express.Router();

// ============================================
// CREATE OPERATIONS
// ============================================

/**
 * Create a new order
 * @route POST /orders/me
 * @access Private - Authenticated users only
 * @description Creates a new order for the logged-in user
 */
router.post("/me", OrdersController.createOrder);

// ============================================
// READ OPERATIONS
// ============================================

/**
 * Get all orders for current user
 * @route GET /orders/me
 * @access Private - Authenticated users only
 * @description Returns all orders placed by the current user
 */
router.get("/me", OrdersController.getMyOrders);

/**
 * Get specific order for current user
 * @route GET /orders/me/:id
 * @access Private - Order owner only
 * @description Returns detailed information about a specific order
 */
router.get("/me/:id", OrdersController.getMyOrderById);

/**
 * Get order statistics for current user
 * @route GET /orders/me/stats
 * @access Private - Authenticated users only
 * @description Returns order count statistics by status
 */
router.get("/me/stats", OrdersController.getMyOrderStats);

// ============================================
// UPDATE OPERATIONS
// ============================================

/**
 * Update user's own order
 * @route PUT /orders/me/:id
 * @access Private - Order owner only
 * @description Users can update notes or cancel pending orders
 */
router.put("/me/:id", OrdersController.updateMyOrder);

// ============================================
// EXPORT
// ============================================

export default router;
