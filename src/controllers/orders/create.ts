/// <reference path="../../types/express.d.ts" />
// ============================================
// ORDERS - CREATE OPERATIONS
// ============================================

import { Request, Response } from "express";
import { prisma } from "../../config/database.config.js";
import { ApiResponse } from "../../models/apiResponse.model.js";
import User from "../../models/User.model.js";
import { NotificationService } from "../../services/NotificationService.js";

/**
 * Create a new order for the logged-in user
 * @route POST /orders/me
 * @access Private - Authenticated users only
 */
export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = req.user as User | undefined;
        const { listingId, quantity = 1, notes, transactionId } = req.body;

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

        // Use transaction to ensure safe inventory checking and batch order creation
        const createdOrders = await prisma.$transaction(async (tx) => {
            // 1. Fetch listing (for price and basic checks)
            const listing = await tx.listing.findUnique({
                where: { id: listingId }
            });

            if (!listing) {
                throw new Error("Listing not found");
            }

            if (listing.isAvailable === false) {
                throw new Error("Listing is not available for order");
            }

            if (!listing.price) {
                throw new Error("Listing does not have a price set");
            }

            // 2. Manage Inventory (if applicable) - Decrement TOTAL quantity
            if (listing.managed && listing.inventoryType === 'STOCK') {
                try {
                    await tx.listing.update({
                        where: {
                            id: listingId,
                            availableQty: { gte: quantity }
                        },
                        data: {
                            availableQty: { decrement: quantity }
                        }
                    });
                } catch (e: any) {
                    if (e.code === 'P2025') {
                        throw new Error(`Insufficient stock. Only ${listing.availableQty ?? 0} items available.`);
                    }
                    throw e;
                }
            }

            const unitPrice = Number(listing.price);
            const orders = [];

            // 3. Create N individual orders (Quantity 1 each)
            for (let i = 0; i < quantity; i++) {
                const order = await tx.order.create({
                    data: {
                        userId: user.id,
                        listingId,
                        quantity: 1, // Individual tracking
                        totalPrice: unitPrice,
                        notes,
                        status: 'PENDING',
                        transactionId: transactionId || null
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
                orders.push(order);
            }

            return orders;
        });

        // 4. Send Notifications (Aggregated)
        const orderIds = createdOrders.map(o => o.id);
        NotificationService.sendOrdersCreated(orderIds).catch(err => console.error("Notification failed", err));

        res.api(ApiResponse.success(201, "Orders created successfully", createdOrders));
    } catch (error: any) {
        console.error("Error creating order:", error);
        const code = error.message.includes("Listing not found") ? 404 : 400;
        res.api(ApiResponse.error(code, error.message || "Error creating order", error));
    }
};
