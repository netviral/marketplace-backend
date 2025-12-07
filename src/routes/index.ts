// ============================================
// MAIN ROUTES INDEX
// ============================================
// This file aggregates all route modules and mounts them
// to their respective base paths.

import express from "express";
import vendorsRouter from "./vendors/index.js";
import listingsRouter from "./listings/index.js";
import usersRouter from "./users/index.js";
import ordersRouter from "./orders/index.js";

// ============================================
// ROUTER SETUP
// ============================================

const router = express.Router();

// ============================================
// MOUNT ROUTE MODULES
// ============================================

/**
 * Vendors routes
 * Mounted at: /vendors
 * Handles:
 * - /vendors/me - User's vendors
 * - /vendors/:id - Public vendor access
 * - /vendors/:vendorId/listings - Vendor's listings (nested)
 * - /vendors/:vendorId/orders - Vendor's orders (nested)
 */
router.use("/vendors", vendorsRouter);

/**
 * Listings routes
 * Mounted at: /listings
 * Handles:
 * - /listings - Public listings with filters
 * - /listings/:id - Single listing
 */
router.use("/listings", listingsRouter);

/**
 * Users routes
 * Mounted at: /users
 * Handles:
 * - /users/me - Current user profile
 * - /users/:id - User profile
 */
router.use("/users", usersRouter);

/**
 * Orders routes
 * Mounted at: /orders
 * Handles:
 * - /orders/me - User's orders
 */
router.use("/orders", ordersRouter);

// ============================================
// EXPORT
// ============================================

export default router;
