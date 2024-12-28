-- CreateTable
CREATE TABLE "CoralAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "friendlyName" TEXT NOT NULL,
    "scientificName" TEXT NOT NULL,
    "healthScore" INTEGER NOT NULL,
    "otherDetails" TEXT,
    "fishTankId" TEXT,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "CoralAnalysis_fishTankId_fkey" FOREIGN KEY ("fishTankId") REFERENCES "FishTank" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CoralAnalysis_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
