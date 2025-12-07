/// <reference path="../../types/express.d.ts" />
// ============================================
// ORDERS - UPDATE OPERATIONS
// ============================================

import { Request, Response } from "express";
import { prisma } from "../../config/database.config.js";
import { ApiResponse } from "../../models/apiResponse.model.js";
import User from "../../models/User.model.js";

/**
 * Update an order (user can only update notes and cancel)
 * @route PUT /orders/me/:id
 * @access Private - Order owner only
 */
export const updateMyOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const user = req.user as User | undefined;
        const { notes, status } = req.body;

        if (!user || !user.id) {
            res.api(ApiResponse.error(401, "Unauthorized: No user information found", "unauthorized"));
            return;
        }

        if (!id) {
            res.api(ApiResponse.error(400, "Order ID is required", "missing_order_id"));
            return;
        }

        // Check if order exists and belongs to user
        const existingOrder = await prisma.order.findFirst({
            where: {
                id,
                userId: user.id
            }
        });

        if (!existingOrder) {
            res.api(ApiResponse.error(404, "Order not found or you don't have access to it", "order_not_found"));
            return;
        }

        // Users can only cancel pending orders
        if (status && status !== 'CANCELLED') {
            res.api(ApiResponse.error(403, "Users can only cancel orders, not change to other statuses", "invalid_status_change"));
            return;
        }

        if (status === 'CANCELLED' && existingOrder.status !== 'PENDING') {
            res.api(ApiResponse.error(400, "Only pending orders can be cancelled", "cannot_cancel"));
            return;
        }

        const updateData: Record<string, unknown> = {};
        if (notes !== undefined) updateData.notes = notes;
        if (status === 'CANCELLED') updateData.status = 'CANCELLED';

        const order = await prisma.order.update({
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

        res.api(ApiResponse.success(200, "Order updated successfully", order));
    } catch (error) {
        console.error("Error updating order:", error);
        res.api(ApiResponse.error(500, "Error updating order", error));
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
        const { status, notes } = req.body;

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

        // Check if user is owner or member of this specific vendor
        const vendor = await prisma.vendor.findFirst({
            where: {
                id: vendorId,
                OR: [
                    { owners: { some: { email: user.email } } },
                    { members: { some: { email: user.email } } }
                ]
            }
        });

        if (!vendor) {
            res.api(ApiResponse.error(403, "You don't have access to this vendor", "no_vendor_access"));
            return;
        }

        // Check if order exists and belongs to this vendor
        const existingOrder = await prisma.order.findFirst({
            where: {
                id,
                listing: {
                    vendorId
                }
            }
        });

        if (!existingOrder) {
            res.api(ApiResponse.error(404, "Order not found for this vendor", "order_not_found"));
            return;
        }

        // Validate status transitions
        if (status) {
            // PENDING can go to CONFIRMED or CANCELLED
            if (existingOrder.status === 'PENDING' && !['CONFIRMED', 'CANCELLED'].includes(status)) {
                res.api(ApiResponse.error(400, "Pending orders can only be moved to CONFIRMED or CANCELLED", "invalid_status_transition"));
                return;
            }
            // CONFIRMED can go to DELIVERED or CANCELLED
            if (existingOrder.status === 'CONFIRMED' && !['DELIVERED', 'CANCELLED'].includes(status)) {
                res.api(ApiResponse.error(400, "Confirmed orders can only be moved to DELIVERED or CANCELLED", "invalid_status_transition"));
                return;
            }
            // DELIVERED and CANCELLED are final states
            if (existingOrder.status === 'DELIVERED') {
                res.api(ApiResponse.error(400, "Delivered orders cannot be modified", "order_already_delivered"));
                return;
            }
            if (existingOrder.status === 'CANCELLED') {
                res.api(ApiResponse.error(400, "Cancelled orders cannot be modified", "order_already_cancelled"));
                return;
            }
        }

        const updateData: Record<string, unknown> = {};
        if (status !== undefined) updateData.status = status;
        if (notes !== undefined) updateData.notes = notes;

        const order = await prisma.order.update({
            where: { id },
            data: updateData as any,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true
                    }
                },
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

        res.api(ApiResponse.success(200, "Order updated successfully", order));
    } catch (error) {
        console.error("Error updating vendor order:", error);
        res.api(ApiResponse.error(500, "Error updating vendor order", error));
    }
};
