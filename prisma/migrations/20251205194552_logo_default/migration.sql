-- AlterTable
ALTER TABLE "User" ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "Vendor" ALTER COLUMN "logo" SET DEFAULT '';
