-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FishTankMaintenance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "maintenanceType" TEXT NOT NULL,
    "extraDetails" TEXT NOT NULL,
    "fishTankId" TEXT,
    CONSTRAINT "FishTankMaintenance_fishTankId_fkey" FOREIGN KEY ("fishTankId") REFERENCES "FishTank" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FishTankMaintenance" ("createdAt", "extraDetails", "id", "maintenanceType", "updatedAt") SELECT "createdAt", "extraDetails", "id", "maintenanceType", "updatedAt" FROM "FishTankMaintenance";
DROP TABLE "FishTankMaintenance";
ALTER TABLE "new_FishTankMaintenance" RENAME TO "FishTankMaintenance";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
