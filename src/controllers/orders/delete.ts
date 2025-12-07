/// <reference path="../../types/express.d.ts" />
// ============================================
// ORDERS - DELETE OPERATIONS
// ============================================

import { Request, Response } from "express";
import { prisma } from "../../config/database.config.js";
import { ApiResponse } from "../../models/apiResponse.model.js";

/**
 * Delete order (Admin only)
 * @route DELETE /orders/:id
 * @access Private - Admin only
 */
export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id) {
            res.api(ApiResponse.error(400, "Order ID is required", "missing_order_id"));
            return;
        }

        const order = await prisma.order.findUnique({ where: { id } });

        if (!order) {
            res.api(ApiResponse.error(404, "Order not found", "order_not_found"));
            return;
        }

        await prisma.order.delete({ where: { id } });

        res.api(ApiResponse.success(200, "Order deleted successfully", null));
    } catch (error) {
        console.error("Error deleting order:", error);
        res.api(ApiResponse.error(500, "Error deleting order", error));
    }
};
