// ============================================
// ENVIRONMENT CONFIGURATION
// ============================================
// This file validates and exports environment variables
// using Zod schema validation for type safety.

import { z } from "zod";
import dotenv from "dotenv";
import path from "path";
import ms from "ms";

// ============================================
// LOAD ENVIRONMENT VARIABLES
// ============================================

// Load .env file from project root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Safely converts duration strings to milliseconds
 * @param value - Duration string (e.g., "15m", "2h", "7d")
 * @returns Duration in milliseconds
 */
function msSafe(value: string): number {
    return (ms as unknown as (v: string) => number)(value);
}

/**
 * Zod schema to validate and transform duration strings
 * Converts strings like "15m" to milliseconds (900000)
 */
const durationSchema = z.string().transform((value, ctx) => {
    const converted = msSafe(value);
    if (typeof converted !== "number") {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Invalid duration format: "${value}". Expected "15m", "2h", "7d", etc.`,
        });
        return z.NEVER;
    }
    return converted;
});

// ============================================
// ENVIRONMENT SCHEMA
// ============================================

/**
 * Zod schema for validating environment variables
 * Ensures all required variables are present and correctly formatted
 */
const envSchema = z.object({
    // Server port
    PORT: z.string().transform((val, ctx) => {
        const num = Number(val);
        if (isNaN(num)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "PORT must be a number",
            });
            return z.NEVER;
        }
        return num;
    }),

    // JWT secrets
    JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),
    JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),

    // JWT expiration times (as strings, will be converted to ms)
    JWT_EXPIRES_IN: z.string().min(1),          // e.g., "15m"
    JWT_REFRESH_EXPIRES_IN: z.string().min(1),  // e.g., "30d"

    // Allowed email domains for registration
    ALLOWED_DOMAINS: z
        .string()
        .default("ashoka.edu.in")
        .transform((v) =>
            v
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
        ),

    // Allowed email addresses (whitelist)
    ALLOWED_LIST: z
        .string()
        .transform((v) =>
            v
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
        ),
});

// ============================================
// PARSE AND EXPORT
// ============================================

// Parse environment variables with schema validation
const parsed = envSchema.parse(process.env);

/**
 * Validated and typed environment configuration
 * Includes both original values and computed values (durations in ms)
 */
const ENV = {
    ...parsed,
    // Convert duration strings to milliseconds for use in JWT signing
    JWT_EXPIRES_IN_MS: durationSchema.parse(parsed.JWT_EXPIRES_IN),
    JWT_REFRESH_EXPIRES_IN_MS: durationSchema.parse(parsed.JWT_REFRESH_EXPIRES_IN),
};

export default ENV;
