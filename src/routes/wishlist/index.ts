/// <reference path="../../types/express.d.ts" />
// ============================================
// WISHLIST ROUTES
// ============================================

import express from "express";
import * as WishlistController from "../../controllers/wishlist/index.js";

const router = express.Router();

/**
 * Get my wishlist
 * @route GET /wishlist/me
 * @access Private
 */
router.get("/me", WishlistController.getMyWishlist);

/**
 * Add listing to wishlist
 * @route POST /wishlist/:listingId
 * @access Private
 */
router.post("/:listingId", WishlistController.addToWishlist);

/**
 * Remove listing from wishlist
 * @route DELETE /wishlist/:listingId
 * @access Private
 */
router.delete("/:listingId", WishlistController.removeFromWishlist);

export default router;
