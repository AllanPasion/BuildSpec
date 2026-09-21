-- AlterTable
ALTER TABLE "Vehicle"
ADD COLUMN "finalImageUrl" TEXT NOT NULL DEFAULT '',
ADD COLUMN "showcasePublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "showcasedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Modification"
ADD COLUMN "installImageUrl" TEXT NOT NULL DEFAULT '';
