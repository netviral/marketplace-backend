// ============================================
// DATABASE CONFIGURATION
// ============================================
// This file configures and exports the Prisma Client instance
// for database operations across the application.

import { PrismaClient } from "@prisma/client";

// ============================================
// PRISMA CLIENT INSTANCE
// ============================================

/**
 * Singleton Prisma Client instance
 * Used for all database operations throughout the application
 */
export const prisma = new PrismaClient();

// ============================================
// CONNECTION TEST
// ============================================

/**
 * Tests the database connection on application startup
 * Logs success or failure to console
 */
async function testConnection() {
    try {
        await prisma.$connect();
        console.log("✅ Prisma connected successfully");
    } catch (err) {
        console.error("❌ Prisma connection failed:", err);
    }
}

// Test connection on module load
testConnection();
