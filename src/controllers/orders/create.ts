/// <reference path="../../types/express.d.ts" />
// ============================================
// ORDERS - CREATE OPERATIONS
// ============================================

import { Request, Response } from "express";
import { prisma } from "../../config/database.config.js";
import { ApiResponse } from "../../models/apiResponse.model.js";
import User from "../../models/User.model.js";

/**
 * Create a new order for the logged-in user
 * @route POST /orders/me
 * @access Private - Authenticated users only
 */
export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = req.user as User | undefined;
        const { listingId, quantity = 1, notes } = req.body;

        // Check authentication
        if (!user || !user.id) {
            res.api(ApiResponse.error(401, "Unauthorized: No user information found", "unauthorized"));
            return;
        }

        // Validate required fields
        if (!listingId || typeof listingId !== 'string') {
            res.api(ApiResponse.error(400, "Validation error: 'listingId' is required", "invalid_listing_id"));
            return;
        }

        if (quantity !== undefined && (typeof quantity !== 'number' || quantity < 1)) {
            res.api(ApiResponse.error(400, "Validation error: 'quantity' must be a positive number", "invalid_quantity"));
            return;
        }

        // Fetch the listing to calculate total price
        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
            select: {
                id: true,
                price: true,
                isAvailable: true,
                availableQty: true,
                name: true
            }
        });

        if (!listing) {
            res.api(ApiResponse.error(404, "Listing not found", "listing_not_found"));
            return;
        }

        if (listing.isAvailable === false) {
            res.api(ApiResponse.error(400, "Listing is not available for order", "listing_unavailable"));
            return;
        }

        if (listing.availableQty !== null && listing.availableQty < quantity) {
            res.api(ApiResponse.error(400, `Only ${listing.availableQty} items available`, "insufficient_quantity"));
            return;
        }

        if (!listing.price) {
            res.api(ApiResponse.error(400, "Listing does not have a price set", "no_price"));
            return;
        }

        const totalPrice = Number(listing.price) * quantity;

        // Create the order
        const order = await prisma.order.create({
            data: {
                userId: user.id,
                listingId,
                quantity,
                totalPrice,
                notes,
                status: 'PENDING'
            },
            include: {
                listing: {
                    include: {
                        vendor: {
                            select: {
                                id: true,
                                name: true,
                                logo: true
                            }
                        }
                    }
                }
            }
        });

        res.api(ApiResponse.success(201, "Order created successfully", order));
    } catch (error) {
        console.error("Error creating order:", error);
        res.api(ApiResponse.error(500, "Error creating order", error));
    }
};
