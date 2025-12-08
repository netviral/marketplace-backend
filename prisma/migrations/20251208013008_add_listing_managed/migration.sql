-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "managed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "comments" SET NOT NULL,
ALTER COLUMN "comments" SET DEFAULT '',
ALTER COLUMN "comments" SET DATA TYPE TEXT;
