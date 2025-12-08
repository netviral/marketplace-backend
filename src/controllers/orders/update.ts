/// <reference path="../../types/express.d.ts" />
// ============================================
// ORDERS - UPDATE OPERATIONS
// ============================================

import { Request, Response } from "express";
import { prisma } from "../../config/database.config.js";
import { ApiResponse } from "../../models/apiResponse.model.js";
import User from "../../models/User.model.js";
import { NotificationService } from "../../services/NotificationService.js";

/**
 * Update an order (user can only update notes, transactionId, and cancel)
 * @route PUT /orders/me/:id
 * @access Private - Order owner only
 */
export const updateMyOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const user = req.user as User | undefined;
        const { notes, status, transactionId } = req.body;

        if (!user || !user.id) {
            res.api(ApiResponse.error(401, "Unauthorized: No user information found", "unauthorized"));
            return;
        }

        if (!id) {
            res.api(ApiResponse.error(400, "Order ID is required", "missing_order_id"));
            return;
        }

        const updatedOrder = await prisma.$transaction(async (tx) => {
            // Check if order exists and belongs to user
            const existingOrder = await tx.order.findFirst({
                where: {
                    id,
                    userId: user.id
                },
                include: {
                    listing: true
                }
            });

            if (!existingOrder) {
                throw new Error("Order not found or you don't have access to it");
            }

            if (status && status !== 'CANCELLED') {
                throw new Error("Users can only cancel orders, not change to other statuses");
            }

            if (status === 'CANCELLED') {
                if (existingOrder.status === 'DELIVERED' || existingOrder.status === 'CANCELLED') {
                    throw new Error("Only pending or confirmed orders can be cancelled");
                }
            }

            const updateData: Record<string, unknown> = {};
            if (notes !== undefined) updateData.notes = notes;
            if (status === 'CANCELLED') updateData.status = 'CANCELLED';
            if (transactionId !== undefined) updateData.transactionId = transactionId;

            // Handle Inventory Restore
            if (status === 'CANCELLED') {
                if (existingOrder.listing.managed && existingOrder.listing.inventoryType === 'STOCK') {
                    // Increment logic (+1 for each item quantity ordered)
                    await tx.listing.update({
                        where: { id: existingOrder.listingId },
                        data: {
                            availableQty: { increment: existingOrder.quantity }
                        }
                    });
                }
            }

            return await tx.order.update({
                where: { id },
                data: updateData as any,
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
        });

        // Notifications
        if (status === 'CANCELLED') {
            NotificationService.sendOrderCancelled(id).catch(err => console.error("Notification failed", err));
        }

        res.api(ApiResponse.success(200, "Order updated successfully", updatedOrder));
    } catch (error: any) {
        console.error("Error updating order:", error);
        const msg = error.message || "Error updating order";
        const code = msg.includes("not found") ? 404 : 400;
        res.api(ApiResponse.error(code, msg, error));
    }
};

/**
 * Update order status (vendor can update status)
 * @route PUT /vendors/:vendorId/orders/:id
 * @access Private - Vendor owner or member only
 */
export const updateVendorOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { vendorId, id } = req.params;
        const user = req.user as User | undefined;
        const { status, notes, transactionId } = req.body;

        if (!user || !user.email) {
            res.api(ApiResponse.error(401, "Unauthorized: No user information found", "unauthorized"));
            return;
        }

        if (!vendorId) {
            res.api(ApiResponse.error(400, "Vendor ID is required", "missing_vendor_id"));
            return;
        }

        if (!id) {
            res.api(ApiResponse.error(400, "Order ID is required", "missing_order_id"));
            return;
        }

        // Validate status
        const validStatuses = ['PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED'];
        if (status && !validStatuses.includes(status)) {
            res.api(ApiResponse.error(400, `Status must be one of: ${validStatuses.join(', ')}`, "invalid_status"));
            return;
        }

        const order = await prisma.$transaction(async (tx) => {
            // Check if user is owner or member
            const vendor = await tx.vendor.findFirst({
                where: {
                    id: vendorId,
                    OR: [
                        { owners: { some: { email: user.email } } },
                        { members: { some: { email: user.email } } }
                    ]
                }
            });

            if (!vendor) {
                throw new Error("You don't have access to this vendor or vendor not found"); // Map to 403/404
            }

            const existingOrder = await tx.order.findFirst({
                where: {
                    id,
                    listing: { vendorId }
                }
            });

            if (!existingOrder) {
                throw new Error("Order not found for this vendor"); // Map to 404
            }

            // Validate status transitions
            if (status) {
                // PENDING can go to CONFIRMED or CANCELLED
                if (existingOrder.status === 'PENDING' && !['CONFIRMED', 'CANCELLED'].includes(status)) {
                    throw new Error("Pending orders can only be moved to CONFIRMED or CANCELLED");
                }
                // CONFIRMED can go to DELIVERED or CANCELLED
                if (existingOrder.status === 'CONFIRMED' && !['DELIVERED', 'CANCELLED'].includes(status)) {
                    throw new Error("Confirmed orders can only be moved to DELIVERED or CANCELLED");
                }
                // DELIVERED and CANCELLED are final states return
                if (existingOrder.status === 'DELIVERED') throw new Error("Delivered orders cannot be modified");
                if (existingOrder.status === 'CANCELLED') throw new Error("Cancelled orders cannot be modified");
            }

            const updateData: Record<string, unknown> = {};
            if (status !== undefined) updateData.status = status;
            if (notes !== undefined) updateData.notes = notes;
            if (transactionId !== undefined) updateData.transactionId = transactionId;

            return await tx.order.update({
                where: { id },
                data: updateData as any,
                include: {
                    user: { select: { id: true, name: true, email: true, phone: true } },
                    listing: { include: { vendor: { select: { id: true, name: true, logo: true } } } }
                }
            });
        });

        // Notifications
        if (status === 'CANCELLED' || status === 'CONFIRMED' || status === 'DELIVERED') {
            // Could send notifications for other statuses too, but focusing on Cancelled as requested
            if (status === 'CANCELLED') {
                NotificationService.sendOrderCancelled(id).catch(console.error);
            }
            // Can add Confirmed/Delivered notifications later
        }

        res.api(ApiResponse.success(200, "Order updated successfully", order));
    } catch (error: any) {
        console.error("Error updating vendor order:", error);
        const msg = error.message || "Error updating vendor order";
        const code = msg.includes("access") ? 403 : (msg.includes("not found") ? 404 : 400); // Simple heuristic
        res.api(ApiResponse.error(code, msg, error));
    }
};
