/// <reference path="../../types/express.d.ts" />
// ============================================
// LISTINGS - READ OPERATIONS
// ============================================

import { Request, Response } from "express";
import { prisma } from "../../config/database.config.js";
import { ApiResponse } from "../../models/apiResponse.model.js";

/**
 * Get all listings with filters
 * @route GET /listings
 * @access Public
 */
import { QueryService } from "../../services/QueryService.js";

/**
 * Get all listings with filters
 * @route GET /listings
 * @access Public
 * @query page - Page number
 * @query limit - Per page limit
 * @query search - Search by name/description
 * @query sort - Sort order e.g. "price:asc,createdAt:desc"
 * @query vendorId - Exact match
 * @query type - Exact match
 * @query tags - Comma separated tags
 */
export const getAllListings = async (req: Request, res: Response): Promise<void> => {
    try {
        const { tags } = req.query;
        const additionalWhere: any = {};

        // Tags filter logic
        if (tags) {
            const tagArray = (tags as string).split(',').map(t => t.trim());
            additionalWhere.tags = {
                some: {
                    name: {
                        in: tagArray
                    }
                }
            };
        }

        const result = await QueryService.query(prisma.listing, req.query, {
            searchFields: ['name', 'description'],
            allowedFilters: ['vendorId', 'type', 'isAvailable', 'inventoryType'],
            additionalWhere,
            include: {
                vendor: {
                    select: {
                        id: true,
                        name: true,
                        logo: true
                    }
                },
                tags: true
            }
        });

        res.api(ApiResponse.success(200, "Listings fetched successfully", result));
    } catch (error) {
        console.error("Error fetching listings:", error);
        res.api(ApiResponse.error(500, "Error fetching listings", error));
    }
};

/**
 * Get listing by ID
 * @route GET /listings/:id
 * @access Public
 */
export const getListingById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id) {
            res.api(ApiResponse.error(400, "Listing ID is required", "missing_listing_id"));
            return;
        }

        const listing = await prisma.listing.findUnique({
            where: { id },
            include: {
                vendor: {
                    select: {
                        id: true,
                        name: true,
                        logo: true,
                        description: true,
                        upiId: true,
                        paymentInformation: true,
                        contactEmail: true,
                        contactPhone: true
                    }
                },
                tags: true,
                reviews: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                imageUrl: true
                            }
                        }
                    }
                }
            }
        });

        if (!listing) {
            res.api(ApiResponse.error(404, "Listing not found", "listing_not_found"));
            return;
        }

        res.api(ApiResponse.success(200, "Listing fetched successfully", listing));
    } catch (error) {
        console.error("Error fetching listing:", error);
        res.api(ApiResponse.error(500, "Error fetching listing", error));
    }
};

/**
 * Get all listings for a specific vendor
 * @route GET /vendors/:vendorId/listings
 * @access Public
 */
export const getVendorListings = async (req: Request, res: Response): Promise<void> => {
    try {
        const { vendorId } = req.params;

        if (!vendorId) {
            res.api(ApiResponse.error(400, "Vendor ID is required", "missing_vendor_id"));
            return;
        }

        const listings = await prisma.listing.findMany({
            where: { vendorId },
            include: {
                tags: true,
                _count: {
                    select: {
                        reviews: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.api(ApiResponse.success(200, "Vendor listings fetched successfully", listings));
    } catch (error) {
        console.error("Error fetching vendor listings:", error);
        res.api(ApiResponse.error(500, "Error fetching vendor listings", error));
    }
};
