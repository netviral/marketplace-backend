/// <reference path="../../types/express.d.ts" />
import express from "express";
import * as ReviewsController from "../../controllers/reviews/index.js";

const router = express.Router();

/**
 * Get reviews (filter by ?listingId=...)
 * @route GET /reviews
 * @access Public
 */
router.get("/", ReviewsController.getReviews);

/**
 * Get my reviews
 * @route GET /reviews/me
 * @access Private
 */
router.get("/me", ReviewsController.getMyReviews);

/**
 * Create a review
 * @route POST /reviews
 * @access Private
 */
router.post("/", ReviewsController.createReview);

/**
 * Update a review
 * @route PUT /reviews/:id
 * @access Private
 */
router.put("/:id", ReviewsController.updateReview);

/**
 * Delete a review
 * @route DELETE /reviews/:id
 * @access Private
 */
router.delete("/:id", ReviewsController.deleteReview);

export default router;
