-- CreateTable
CREATE TABLE "FishTankMaintenance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "maintenanceType" TEXT NOT NULL,
    "extraDetails" TEXT NOT NULL
);
