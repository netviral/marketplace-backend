/// <reference path="../../types/express.d.ts" />
// ============================================
// ORDERS - READ OPERATIONS (USER)
// ============================================

import { Request, Response } from "express";
import { prisma } from "../../config/database.config.js";
import { ApiResponse } from "../../models/apiResponse.model.js";
import User from "../../models/User.model.js";

/**
 * Get all orders for the logged-in user
 * @route GET /orders/me
 * @access Private - Authenticated users only
 */
export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = req.user as User | undefined;

        if (!user || !user.id) {
            res.api(ApiResponse.error(401, "Unauthorized: No user information found", "unauthorized"));
            return;
        }

        const orders = await prisma.order.findMany({
            where: { userId: user.id },
            include: {
                listing: {
                    include: {
                        vendor: {
                            select: {
                                id: true,
                                name: true,
                                logo: true,
                                contactEmail: true,
                                contactPhone: true
                            }
                        },
                        tags: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.api(ApiResponse.success(200, "User orders fetched successfully", orders));
    } catch (error) {
        console.error("Error fetching user orders:", error);
        res.api(ApiResponse.error(500, "Error fetching user orders", error));
    }
};

/**
 * Get a specific order by ID for the logged-in user
 * @route GET /orders/me/:id
 * @access Private - Authenticated users only
 */
export const getMyOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const user = req.user as User | undefined;

        if (!user || !user.id) {
            res.api(ApiResponse.error(401, "Unauthorized: No user information found", "unauthorized"));
            return;
        }

        if (!id) {
            res.api(ApiResponse.error(400, "Order ID is required", "missing_order_id"));
            return;
        }

        const order = await prisma.order.findFirst({
            where: {
                id,
                userId: user.id
            },
            include: {
                listing: {
                    include: {
                        vendor: {
                            select: {
                                id: true,
                                name: true,
                                logo: true,
                                description: true,
                                contactEmail: true,
                                contactPhone: true
                            }
                        },
                        tags: true
                    }
                }
            }
        });

        if (!order) {
            res.api(ApiResponse.error(404, "Order not found or you don't have access to it", "order_not_found"));
            return;
        }

        res.api(ApiResponse.success(200, "Order fetched successfully", order));
    } catch (error) {
        console.error("Error fetching order:", error);
        res.api(ApiResponse.error(500, "Error fetching order", error));
    }
};

/**
 * Get order statistics for user
 * @route GET /orders/me/stats
 * @access Private - Authenticated users only
 */
export const getMyOrderStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = req.user as User | undefined;

        if (!user || !user.id) {
            res.api(ApiResponse.error(401, "Unauthorized: No user information found", "unauthorized"));
            return;
        }

        const [total, pending, confirmed, delivered, cancelled] = await Promise.all([
            prisma.order.count({ where: { userId: user.id } }),
            prisma.order.count({ where: { userId: user.id, status: 'PENDING' } }),
            prisma.order.count({ where: { userId: user.id, status: 'CONFIRMED' } }),
            prisma.order.count({ where: { userId: user.id, status: 'DELIVERED' } }),
            prisma.order.count({ where: { userId: user.id, status: 'CANCELLED' } })
        ]);

        const stats = {
            total,
            byStatus: {
                pending,
                confirmed,
                delivered,
                cancelled
            }
        };

        res.api(ApiResponse.success(200, "User order statistics fetched successfully", stats));
    } catch (error) {
        console.error("Error fetching user order stats:", error);
        res.api(ApiResponse.error(500, "Error fetching user order statistics", error));
    }
};

/**
 * Get all orders for a specific vendor
 * @route GET /vendors/:vendorId/orders
 * @access Private - Vendor owner or member only
 */
export const getVendorOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const { vendorId } = req.params;
        const user = req.user as User | undefined;
        const { status } = req.query;

        if (!user || !user.email) {
            res.api(ApiResponse.error(401, "Unauthorized: No user information found", "unauthorized"));
            return;
        }

        if (!vendorId) {
            res.api(ApiResponse.error(400, "Vendor ID is required", "missing_vendor_id"));
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

        // Build where clause
        const where: Record<string, unknown> = {
            listing: {
                vendorId
            }
        };

        if (status) {
            where.status = status;
        }

        const orders = await prisma.order.findMany({
            where: where as any,
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
            },
            orderBy: { createdAt: 'desc' }
        });

        res.api(ApiResponse.success(200, "Vendor orders fetched successfully", orders));
    } catch (error) {
        console.error("Error fetching vendor orders:", error);
        res.api(ApiResponse.error(500, "Error fetching vendor orders", error));
    }
};

/**
 * Get a specific order for a specific vendor
 * @route GET /vendors/:vendorId/orders/:id
 * @access Private - Vendor owner or member only
 */
export const getVendorOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { vendorId, id } = req.params;
        const user = req.user as User | undefined;

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

        const order = await prisma.order.findFirst({
            where: {
                id,
                listing: {
                    vendorId
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        address: true
                    }
                },
                listing: {
                    include: {
                        vendor: {
                            select: {
                                id: true,
                                name: true,
                                logo: true,
                                description: true
                            }
                        },
                        tags: true
                    }
                }
            }
        });

        if (!order) {
            res.api(ApiResponse.error(404, "Order not found for this vendor", "order_not_found"));
            return;
        }

        res.api(ApiResponse.success(200, "Order fetched successfully", order));
    } catch (error) {
        console.error("Error fetching vendor order:", error);
        res.api(ApiResponse.error(500, "Error fetching vendor order", error));
    }
};

/**
 * Get order statistics for a specific vendor
 * @route GET /vendors/:vendorId/orders/stats
 * @access Private - Vendor owner or member only
 */
export const getVendorOrderStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const { vendorId } = req.params;
        const user = req.user as User | undefined;

        if (!user || !user.email) {
            res.api(ApiResponse.error(401, "Unauthorized: No user information found", "unauthorized"));
            return;
        }

        if (!vendorId) {
            res.api(ApiResponse.error(400, "Vendor ID is required", "missing_vendor_id"));
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

        const [total, pending, confirmed, delivered, cancelled] = await Promise.all([
            prisma.order.count({ where: { listing: { vendorId } } }),
            prisma.order.count({ where: { listing: { vendorId }, status: 'PENDING' } }),
            prisma.order.count({ where: { listing: { vendorId }, status: 'CONFIRMED' } }),
            prisma.order.count({ where: { listing: { vendorId }, status: 'DELIVERED' } }),
            prisma.order.count({ where: { listing: { vendorId }, status: 'CANCELLED' } })
        ]);

        const stats = {
            vendorId,
            vendorName: vendor.name,
            total,
            byStatus: {
                pending,
                confirmed,
                delivered,
                cancelled
            }
        };

        res.api(ApiResponse.success(200, "Vendor order statistics fetched successfully", stats));
    } catch (error) {
        console.error("Error fetching vendor order stats:", error);
        res.api(ApiResponse.error(500, "Error fetching vendor order statistics", error));
    }
};
