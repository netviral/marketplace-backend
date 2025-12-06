-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "variants" TEXT[] DEFAULT ARRAY[]::TEXT[];
