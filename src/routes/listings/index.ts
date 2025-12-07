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
 * @access Public
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
 * @access Public
 * @description Returns detailed information about a specific listing
 */
router.get("/:id", ListingsController.getListingById);

// ============================================
// EXPORT
// ============================================

export default router;
