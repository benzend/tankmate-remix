-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Fish" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "speciesId" TEXT NOT NULL,
    "fishTankId" TEXT NOT NULL,
    CONSTRAINT "Fish_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "FishSpecies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Fish_fishTankId_fkey" FOREIGN KEY ("fishTankId") REFERENCES "FishTank" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Fish" ("createdAt", "fishTankId", "id", "name", "size", "speciesId", "updatedAt") SELECT "createdAt", "fishTankId", "id", "name", "size", "speciesId", "updatedAt" FROM "Fish";
DROP TABLE "Fish";
ALTER TABLE "new_Fish" RENAME TO "Fish";
CREATE TABLE "new_FishSpecies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "friendlyName" TEXT NOT NULL,
    "scientificName" TEXT NOT NULL,
    "count" INTEGER NOT NULL
);
INSERT INTO "new_FishSpecies" ("count", "createdAt", "friendlyName", "id", "scientificName", "updatedAt") SELECT "count", "createdAt", "friendlyName", "id", "scientificName", "updatedAt" FROM "FishSpecies";
DROP TABLE "FishSpecies";
ALTER TABLE "new_FishSpecies" RENAME TO "FishSpecies";
CREATE TABLE "new_FishTank" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "waterType" TEXT NOT NULL,
    "dimensionsLength" INTEGER NOT NULL,
    "dimensionsWidth" INTEGER NOT NULL,
    "dimensionsHeight" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "FishTank_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FishTank" ("createdAt", "dimensionsHeight", "dimensionsLength", "dimensionsWidth", "id", "name", "updatedAt", "userId", "waterType") SELECT "createdAt", "dimensionsHeight", "dimensionsLength", "dimensionsWidth", "id", "name", "updatedAt", "userId", "waterType" FROM "FishTank";
DROP TABLE "FishTank";
ALTER TABLE "new_FishTank" RENAME TO "FishTank";
CREATE TABLE "new_FishTankPump" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "pumpType" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "fishTankId" TEXT NOT NULL,
    CONSTRAINT "FishTankPump_fishTankId_fkey" FOREIGN KEY ("fishTankId") REFERENCES "FishTank" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FishTankPump" ("createdAt", "fishTankId", "id", "pumpType", "size", "updatedAt") SELECT "createdAt", "fishTankId", "id", "pumpType", "size", "updatedAt" FROM "FishTankPump";
DROP TABLE "FishTankPump";
ALTER TABLE "new_FishTankPump" RENAME TO "FishTankPump";
CREATE TABLE "new_FishTankScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "result" TEXT NOT NULL,
    "context" TEXT,
    "imageUrl" TEXT,
    "fishTankId" TEXT NOT NULL,
    CONSTRAINT "FishTankScore_fishTankId_fkey" FOREIGN KEY ("fishTankId") REFERENCES "FishTank" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FishTankScore" ("context", "createdAt", "fishTankId", "id", "imageUrl", "result", "updatedAt") SELECT "context", "createdAt", "fishTankId", "id", "imageUrl", "result", "updatedAt" FROM "FishTankScore";
DROP TABLE "FishTankScore";
ALTER TABLE "new_FishTankScore" RENAME TO "FishTankScore";
CREATE TABLE "new_Plant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "speciesId" TEXT NOT NULL,
    "fishTankId" TEXT NOT NULL,
    CONSTRAINT "Plant_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "PlantSpecies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Plant_fishTankId_fkey" FOREIGN KEY ("fishTankId") REFERENCES "FishTank" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Plant" ("createdAt", "fishTankId", "id", "name", "size", "speciesId", "updatedAt") SELECT "createdAt", "fishTankId", "id", "name", "size", "speciesId", "updatedAt" FROM "Plant";
DROP TABLE "Plant";
ALTER TABLE "new_Plant" RENAME TO "Plant";
CREATE TABLE "new_PlantSpecies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "friendlyName" TEXT NOT NULL,
    "scientificName" TEXT NOT NULL,
    "count" INTEGER NOT NULL
);
INSERT INTO "new_PlantSpecies" ("count", "createdAt", "friendlyName", "id", "scientificName", "updatedAt") SELECT "count", "createdAt", "friendlyName", "id", "scientificName", "updatedAt" FROM "PlantSpecies";
DROP TABLE "PlantSpecies";
ALTER TABLE "new_PlantSpecies" RENAME TO "PlantSpecies";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
