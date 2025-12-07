/// <reference path="../../types/express.d.ts" />
// ============================================
// VENDORS ROUTES
// ============================================
// This file defines all vendor-related routes and maps them
// to their corresponding controller functions.
// 
// Base path: /vendors (mounted in main routes/index.ts)

import express from "express";
import * as VendorsController from "../../controllers/vendors/index.js";
import * as ListingsController from "../../controllers/listings/index.js";
import * as OrdersController from "../../controllers/orders/index.js";
import { checkVendorOwnership } from "../../middlewares/vendorOwnership.middleware.js";
import { checkVendorAccess } from "../../middlewares/vendorAccess.middleware.js";
import { RoleMiddleware } from "../../middlewares/role.middleware.js";

// ============================================
// ROUTER SETUP
// ============================================

const router = express.Router();

// ============================================
// CREATE OPERATIONS - VENDORS
// ============================================

/**
 * Create a new vendor
 * @route POST /vendors/me
 * @access Private - Authenticated users only
 * @description Creates a new vendor with the current user as owner
 */
router.post("/me", VendorsController.createVendor);

// ============================================
// READ OPERATIONS - VENDORS
// ============================================

/**
 * Get all vendors owned by current user
 * @route GET /vendors/me
 * @access Private - Authenticated users only
 * @description Returns all vendors where the current user is an owner
 */
router.get("/me", VendorsController.getMyVendors);

/**
 * Get specific vendor owned by current user
 * @route GET /vendors/me/:id
 * @access Private - Owner only
 * @description Returns detailed information about a specific vendor owned by the user
 */
router.get("/me/:id", VendorsController.getMyVendorById);

/**
 * Get all vendors (public)
 * @route GET /vendors
 * @access Public
 * @query verified - Filter by verification status (true/false)
 * @query search - Search by name or description
 * @description Returns all vendors with optional filtering
 */
router.get("/", VendorsController.getAllVendors);

/**
 * Get vendor by ID (public)
 * @route GET /vendors/:id
 * @access Public
 * @description Returns detailed information about a specific vendor
 */
router.get("/:id", VendorsController.getVendorById);

// ============================================
// UPDATE OPERATIONS - VENDORS
// ============================================

/**
 * Update vendor information
 * @route PUT /vendors/me/:id
 * @access Private - Owner only
 * @description Updates vendor details. Only owners can update their vendors.
 */
router.put("/me/:id", checkVendorOwnership, VendorsController.updateVendor);

// ============================================
// DELETE OPERATIONS - VENDORS
// ============================================

/**
 * Delete vendor
 * @route DELETE /vendors/me/:id
 * @access Private - Owner only
 * @description Permanently deletes a vendor. Only owners can delete their vendors.
 */
router.delete("/me/:id", checkVendorOwnership, VendorsController.deleteVendor);

// ============================================
// SPECIAL OPERATIONS - VENDORS
// ============================================

/**
 * Verify vendor
 * @route POST /vendors/:id/verify
 * @access Private - Admin only
 * @description Marks a vendor as verified. Only admins can verify vendors.
 */
router.post("/:id/verify", RoleMiddleware.requireAdmin, VendorsController.verifyVendor);

// ============================================
// NESTED ROUTES - LISTINGS
// ============================================

/**
 * Create a new listing for a vendor
 * @route POST /vendors/:vendorId/listings
 * @access Private - Vendor owner or member only
 * @description Creates a new listing under the specified vendor
 */
router.post("/:vendorId/listings", ListingsController.createListing);

/**
 * Get all listings for a specific vendor
 * @route GET /vendors/:vendorId/listings
 * @access Public
 * @description Returns all listings belonging to a specific vendor
 */
router.get("/:vendorId/listings", ListingsController.getVendorListings);

/**
 * Update listing
 * @route PUT /vendors/:vendorId/listings/:id
 * @access Private - Vendor owner or member only
 * @description Updates listing details. Only vendor owners/members can update.
 */
router.put("/:vendorId/listings/:id", checkVendorAccess, ListingsController.updateListing);

/**
 * Delete listing
 * @route DELETE /vendors/:vendorId/listings/:id
 * @access Private - Vendor owner or member only
 * @description Permanently deletes a listing. Only vendor owners/members can delete.
 */
router.delete("/:vendorId/listings/:id", checkVendorAccess, ListingsController.deleteListing);

// ============================================
// NESTED ROUTES - ORDERS
// ============================================

/**
 * Get all orders for a specific vendor
 * @route GET /vendors/:vendorId/orders
 * @access Private - Vendor owner or member only
 * @query status - Filter by order status (PENDING, CONFIRMED, DELIVERED, CANCELLED)
 * @description Returns all orders for listings belonging to the specified vendor
 */
router.get("/:vendorId/orders", OrdersController.getVendorOrders);

/**
 * Get specific order for a vendor
 * @route GET /vendors/:vendorId/orders/:id
 * @access Private - Vendor owner or member only
 * @description Returns detailed information about a specific order for the vendor
 */
router.get("/:vendorId/orders/:id", OrdersController.getVendorOrderById);

/**
 * Get order statistics for a specific vendor
 * @route GET /vendors/:vendorId/orders/stats
 * @access Private - Vendor owner or member only
 * @description Returns order count statistics by status for the vendor
 */
router.get("/:vendorId/orders/stats", OrdersController.getVendorOrderStats);

/**
 * Update order status (vendor)
 * @route PUT /vendors/:vendorId/orders/:id
 * @access Private - Vendor owner or member only
 * @description Vendors can update order status through the order lifecycle
 */
router.put("/:vendorId/orders/:id", OrdersController.updateVendorOrder);

// ============================================
// EXPORT
// ============================================

export default router;
