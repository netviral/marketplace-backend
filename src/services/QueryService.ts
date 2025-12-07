import { PrismaClient } from "@prisma/client";

// Define a type for Prisma Model Delegates (generic approach)
// This captures various Prisma methods like findMany, count, etc.
type PrismaModel = {
    findMany: (args: any) => Promise<any[]>;
    count: (args: any) => Promise<number>;
    fields?: any; // Internal property often available on runtime models
};

interface QueryOptions {
    searchFields?: string[];
    allowedFilters?: string[];
    defaultSort?: string; // e.g., "createdAt:desc"
    defaultLimit?: number;
    additionalWhere?: any;
    include?: any;
    select?: any;
}

interface QueryResult<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export class QueryService {
    /**
     * Abstract search, sort, filter, and pagination function for Prisma models.
     * 
     * @param model - The Prisma model delegate (e.g. prisma.vendor)
     * @param query - The Express request query object (req.query)
     * @param options - Configuration for search fields, allowed filters, etc.
     * @returns Promise containing data array and pagination metadata
     */
    static async query<T>(
        model: PrismaModel,
        reqQuery: any,
        options: QueryOptions = {}
    ): Promise<QueryResult<T>> {
        const {
            searchFields = [],
            allowedFilters = [],
            defaultSort = "createdAt:desc",
            defaultLimit = 10
        } = options;

        // 1. Pagination
        const page = Math.max(1, parseInt(reqQuery.page as string) || 1);
        const limit = Math.max(1, parseInt(reqQuery.limit as string) || defaultLimit);
        const skip = (page - 1) * limit;

        // 2. Sorting
        // Format: ?sort=price:asc,createdAt:desc
        const sortParam = (reqQuery.sort as string) || defaultSort;
        const orderBy = sortParam.split(',').map(s => {
            const parts = s.split(':');
            const field = parts[0] as string;
            const order = parts[1] || 'asc';
            return { [field]: order === 'desc' ? 'desc' : 'asc' };
        });

        // 3. Filtering & Searching
        const where: any = {};

        // A. Full-text Search
        if (reqQuery.search && searchFields.length > 0) {
            const searchStr = reqQuery.search as string;
            where['OR'] = searchFields.map(field => ({
                [field]: { contains: searchStr, mode: 'insensitive' } // Case-insensitive search
            }));
        }

        // B. Specific Filters
        // Automatically map allowed filters from query params
        allowedFilters.forEach(field => {
            if (reqQuery[field] !== undefined) {
                let value = reqQuery[field];

                // Handle basic boolean conversion
                if (value === 'true') value = true;
                if (value === 'false') value = false;

                // Handle numbers if the string looks like a number
                if (!isNaN(Number(value)) && typeof value === 'string' && value.trim() !== '') {
                    // Only convert to number if we are sure it's a number field? 
                    // This is risky without schema knowledge. 
                    // Strategy: Prisma is strict. If schema expects Int and we pass String, it might throw.
                    // For now, we simple-pass strings unless specific boolean logic.
                    // Ideally you'd pass type info in allowedFilters, e.g., "price:number".
                }

                where[field] = value;
            }
        });

        if (options.additionalWhere) {
            Object.assign(where, options.additionalWhere);
        }

        // 4. Executing Query
        const queryArgs: any = {
            where,
            orderBy,
            skip,
            take: limit
        };

        if (options.include) queryArgs.include = options.include;
        if (options.select) queryArgs.select = options.select;

        const [total, data] = await Promise.all([
            model.count({ where }),
            model.findMany(queryArgs)
        ]);

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
}
