/// <reference path="../../types/express.d.ts" />
// ============================================
// VENDORS - READ OPERATIONS
// ============================================

import { Request, Response } from "express";
import { prisma } from "../../config/database.config.js";
import { ApiResponse } from "../../models/apiResponse.model.js";
import User from "../../models/User.model.js";

import { QueryService } from "../../services/QueryService.js";

/**
 * Get all vendors (public access)
 * @route GET /vendors
 * @access Public
 * @query page - Page number (default: 1)
 * @query limit - Items per page (default: 10)
 * @query sort - Sort field (e.g. "createdAt:desc")
 * @query search - Search term for name or description
 * @query isVerified - Filter by verification status
 */
export const getAllVendors = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await QueryService.query(prisma.vendor, req.query, {
            searchFields: ['name', 'description'],
            allowedFilters: ['isVerified'],
            defaultSort: 'createdAt:desc',
            select: {
                id: true,
                name: true,
                description: true,
                logo: true,
                categories: true,
                isVerified: true,
                createdAt: true
            }
        });

        res.api(ApiResponse.success(200, "Vendors fetched successfully", result));
    } catch (error) {
        console.error("Error fetching vendors:", error);
        res.api(ApiResponse.error(500, "Error fetching vendors", error));
    }
};

/**
 * Get vendor by ID (public access)
 * @route GET /vendors/:id
 * @access Public
 */
export const getVendorById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id) {
            res.api(ApiResponse.error(400, "Vendor ID is required", "missing_vendor_id"));
            return;
        }

        const vendor = await prisma.vendor.findUnique({
            where: { id },
            include: {
                owners: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                members: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                listings: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        price: true,
                        images: true,
                        isAvailable: true
                    },
                    where: { isAvailable: true }
                }
            }
        });

        if (!vendor) {
            res.api(ApiResponse.error(404, "Vendor not found", "vendor_not_found"));
            return;
        }

        res.api(ApiResponse.success(200, "Vendor fetched successfully", vendor));
    } catch (error) {
        console.error("Error fetching vendor:", error);
        res.api(ApiResponse.error(500, "Error fetching vendor", error));
    }
};

/**
 * Get all vendors owned by the current user
 * @route GET /vendors/me
 * @access Private - Authenticated users only
 */
export const getMyVendors = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = req.user as User | undefined;

        if (!user || !user.email) {
            res.api(ApiResponse.error(401, "Unauthorized: No user information found", "unauthorized"));
            return;
        }

        // Fetch vendors where user is an owner
        const ownedVendors = await prisma.vendor.findMany({
            where: {
                owners: {
                    some: { email: user.email }
                }
            },
            include: {
                _count: {
                    select: {
                        listings: true,
                        members: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Fetch vendors where user is a member (but not an owner)
        const memberVendors = await prisma.vendor.findMany({
            where: {
                members: {
                    some: { email: user.email }
                },
                owners: {
                    none: { email: user.email }
                }
            },
            include: {
                _count: {
                    select: {
                        listings: true,
                        members: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Combine results with relationship type
        const allVendors = [
            ...ownedVendors.map(vendor => ({ ...vendor, isMember: false, isOwner: true })),
            ...memberVendors.map(vendor => ({ ...vendor, isMember: true, isOwner: false }))
        ];

        res.api(ApiResponse.success(200, "My vendors fetched successfully", allVendors));
    } catch (error) {
        console.error("Error fetching my vendors:", error);
        res.api(ApiResponse.error(500, "Error fetching my vendors", error));
    }
};

/**
 * Get a specific vendor owned by the current user
 * @route GET /vendors/me/:id
 * @access Private - Owner only
 */
export const getMyVendorById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const user = req.user as User | undefined;

        if (!user || !user.email) {
            res.api(ApiResponse.error(401, "Unauthorized: No user information found", "unauthorized"));
            return;
        }

        if (!id) {
            res.api(ApiResponse.error(400, "Vendor ID is required", "missing_vendor_id"));
            return;
        }

        const vendor = await prisma.vendor.findFirst({
            where: {
                id,
                owners: {
                    some: { email: user.email }
                }
            },
            include: {
                owners: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                members: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                listings: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        price: true,
                        isAvailable: true
                    }
                }
            }
        });

        if (!vendor) {
            res.api(ApiResponse.error(404, "Vendor not found or you don't have access", "vendor_not_found"));
            return;
        }

        res.api(ApiResponse.success(200, "Vendor fetched successfully", vendor));
    } catch (error) {
        console.error("Error fetching vendor:", error);
        res.api(ApiResponse.error(500, "Error fetching vendor", error));
    }
};
