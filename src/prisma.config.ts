import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log("Prisma connected successfully");
  } catch (err) {
    console.error("Prisma connection failed:", err);
  }
}

testConnection();