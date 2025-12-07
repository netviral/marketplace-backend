/// <reference path="../../types/express.d.ts" />
// ============================================
// LISTINGS ROUTES
// ============================================
// This file defines public listing routes.
// Vendor-specific listing routes are in vendors/index.ts
// 
// Base path: /listings (mounted in main routes/index.ts)

import express from "express";
import * as ListingsController from "../../controllers/listings/index.js";

// ============================================
// ROUTER SETUP
// ============================================

const router = express.Router();

// ============================================
// READ OPERATIONS
// ============================================

/**
 * Get all listings (public)
 * @route GET /listings
 * @access Private
 * @description (Global Auth) Get all listings (public read, but requires login)
 * @query search - Search by name or description
 * @query sort - Sort field and order (e.g., "createdAt:desc")
 * @query tags - Comma-separated tag names
 * @query vendorId - Filter by vendor ID
 * @query type - Filter by listing type (PRODUCT/SERVICE)
 * @description Returns all listings with optional filtering and sorting
 */
router.get("/", ListingsController.getAllListings);

/**
 * Get listing by ID (public)
 * @route GET /listings/:id
 * @access Private
 * @description (Global Auth) Get listing by ID (public read, but requires login)
 * @description Returns detailed information about a specific listing
 */
router.get("/:id", ListingsController.getListingById);

// ============================================
// CREATE OPERATIONS
// ============================================

/**
 * Create a new listing (requires vendorId in body)
 * @route POST /listings
 * @access Private - Vendor owner or member only
 */
router.post("/", ListingsController.createListing);

// ============================================
// UPDATE OPERATIONS
// ============================================

/**
 * Update listing by ID
 * @route PUT /listings/:id
 * @access Private - Vendor owner or member only
 */
router.put("/:id", ListingsController.updateListing);

// ============================================
// DELETE OPERATIONS
// ============================================

/**
 * Delete listing by ID
 * @route DELETE /listings/:id
 * @access Private - Vendor owner or member only
 */
router.delete("/:id", ListingsController.deleteListing);

// ============================================
// EXPORT
// ============================================

export default router;
