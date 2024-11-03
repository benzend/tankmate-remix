-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Fish" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "speciesId" TEXT NOT NULL,
    "fishTankId" TEXT NOT NULL,
    CONSTRAINT "Fish_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "FishSpecies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Fish_fishTankId_fkey" FOREIGN KEY ("fishTankId") REFERENCES "FishTank" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Fish" ("fishTankId", "id", "name", "size", "speciesId") SELECT "fishTankId", "id", "name", "size", "speciesId" FROM "Fish";
DROP TABLE "Fish";
ALTER TABLE "new_Fish" RENAME TO "Fish";
CREATE TABLE "new_FishSpecies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "friendlyName" TEXT NOT NULL,
    "scientificName" TEXT NOT NULL,
    "count" INTEGER NOT NULL
);
INSERT INTO "new_FishSpecies" ("count", "friendlyName", "id", "scientificName") SELECT "count", "friendlyName", "id", "scientificName" FROM "FishSpecies";
DROP TABLE "FishSpecies";
ALTER TABLE "new_FishSpecies" RENAME TO "FishSpecies";
CREATE TABLE "new_FishTank" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "waterType" TEXT NOT NULL,
    "dimensionsLength" INTEGER NOT NULL,
    "dimensionsWidth" INTEGER NOT NULL,
    "dimensionsHeight" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "FishTank_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FishTank" ("dimensionsHeight", "dimensionsLength", "dimensionsWidth", "id", "name", "userId", "waterType") SELECT "dimensionsHeight", "dimensionsLength", "dimensionsWidth", "id", "name", "userId", "waterType" FROM "FishTank";
DROP TABLE "FishTank";
ALTER TABLE "new_FishTank" RENAME TO "FishTank";
CREATE TABLE "new_FishTankPump" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pumpType" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "fishTankId" TEXT NOT NULL,
    CONSTRAINT "FishTankPump_fishTankId_fkey" FOREIGN KEY ("fishTankId") REFERENCES "FishTank" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FishTankPump" ("fishTankId", "id", "pumpType", "size") SELECT "fishTankId", "id", "pumpType", "size" FROM "FishTankPump";
DROP TABLE "FishTankPump";
ALTER TABLE "new_FishTankPump" RENAME TO "FishTankPump";
CREATE TABLE "new_FishTankScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "result" TEXT NOT NULL,
    "context" TEXT,
    "imageUrl" TEXT,
    "fishTankId" TEXT NOT NULL,
    CONSTRAINT "FishTankScore_fishTankId_fkey" FOREIGN KEY ("fishTankId") REFERENCES "FishTank" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FishTankScore" ("context", "fishTankId", "id", "imageUrl", "result") SELECT "context", "fishTankId", "id", "imageUrl", "result" FROM "FishTankScore";
DROP TABLE "FishTankScore";
ALTER TABLE "new_FishTankScore" RENAME TO "FishTankScore";
CREATE TABLE "new_Plant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "speciesId" TEXT NOT NULL,
    "fishTankId" TEXT NOT NULL,
    CONSTRAINT "Plant_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "PlantSpecies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Plant_fishTankId_fkey" FOREIGN KEY ("fishTankId") REFERENCES "FishTank" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Plant" ("fishTankId", "id", "name", "size", "speciesId") SELECT "fishTankId", "id", "name", "size", "speciesId" FROM "Plant";
DROP TABLE "Plant";
ALTER TABLE "new_Plant" RENAME TO "Plant";
CREATE TABLE "new_PlantSpecies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "friendlyName" TEXT NOT NULL,
    "scientificName" TEXT NOT NULL,
    "count" INTEGER NOT NULL
);
INSERT INTO "new_PlantSpecies" ("count", "friendlyName", "id", "scientificName") SELECT "count", "friendlyName", "id", "scientificName" FROM "PlantSpecies";
DROP TABLE "PlantSpecies";
ALTER TABLE "new_PlantSpecies" RENAME TO "PlantSpecies";
CREATE TABLE "new_TankScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "result" TEXT NOT NULL,
    "context" TEXT,
    "imageUrl" TEXT
);
INSERT INTO "new_TankScore" ("context", "id", "imageUrl", "result") SELECT "context", "id", "imageUrl", "result" FROM "TankScore";
DROP TABLE "TankScore";
ALTER TABLE "new_TankScore" RENAME TO "TankScore";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
