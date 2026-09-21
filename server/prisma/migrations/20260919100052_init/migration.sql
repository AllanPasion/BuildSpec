-- CreateEnum
CREATE TYPE "ModificationStatus" AS ENUM ('PLANNED', 'PURCHASED', 'INSTALLED');

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "variant" TEXT NOT NULL DEFAULT '',
    "engine" TEXT NOT NULL DEFAULT '',
    "transmission" TEXT NOT NULL DEFAULT '',
    "color" TEXT NOT NULL DEFAULT '',
    "nickname" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Modification" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "brand" TEXT NOT NULL DEFAULT '',
    "price" DOUBLE PRECISION NOT NULL,
    "status" "ModificationStatus" NOT NULL DEFAULT 'PLANNED',
    "purchaseDate" TEXT NOT NULL DEFAULT '',
    "installDate" TEXT NOT NULL DEFAULT '',
    "installer" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Modification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Modification_vehicleId_idx" ON "Modification"("vehicleId");

-- CreateIndex
CREATE INDEX "Modification_status_idx" ON "Modification"("status");

-- AddForeignKey
ALTER TABLE "Modification" ADD CONSTRAINT "Modification_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
