-- CreateTable
CREATE TABLE "FishTankScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "result" TEXT NOT NULL,
    "context" TEXT,
    "imageUrl" TEXT,
    "fishTankId" TEXT NOT NULL,
    CONSTRAINT "FishTankScore_fishTankId_fkey" FOREIGN KEY ("fishTankId") REFERENCES "FishTank" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FishTank" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "waterType" TEXT NOT NULL,
    "dimensionsLength" INTEGER NOT NULL,
    "dimensionsWidth" INTEGER NOT NULL,
    "dimensionsHeight" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "FishTank_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FishTankPump" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pumpType" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "fishTankId" TEXT NOT NULL,
    CONSTRAINT "FishTankPump_fishTankId_fkey" FOREIGN KEY ("fishTankId") REFERENCES "FishTank" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Fish" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "speciesId" TEXT NOT NULL,
    "fishTankId" TEXT NOT NULL,
    CONSTRAINT "Fish_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "FishSpecies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Fish_fishTankId_fkey" FOREIGN KEY ("fishTankId") REFERENCES "FishTank" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FishSpecies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "friendlyName" TEXT NOT NULL,
    "scientificName" TEXT NOT NULL,
    "count" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Plant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "speciesId" TEXT NOT NULL,
    "fishTankId" TEXT NOT NULL,
    CONSTRAINT "Plant_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "PlantSpecies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Plant_fishTankId_fkey" FOREIGN KEY ("fishTankId") REFERENCES "FishTank" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlantSpecies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "friendlyName" TEXT NOT NULL,
    "scientificName" TEXT NOT NULL,
    "count" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "FishTankScore_fishTankId_key" ON "FishTankScore"("fishTankId");

-- CreateIndex
CREATE UNIQUE INDEX "FishTank_userId_key" ON "FishTank"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FishTankPump_fishTankId_key" ON "FishTankPump"("fishTankId");

-- CreateIndex
CREATE UNIQUE INDEX "Fish_speciesId_key" ON "Fish"("speciesId");

-- CreateIndex
CREATE UNIQUE INDEX "Fish_fishTankId_key" ON "Fish"("fishTankId");

-- CreateIndex
CREATE UNIQUE INDEX "Plant_speciesId_key" ON "Plant"("speciesId");

-- CreateIndex
CREATE UNIQUE INDEX "Plant_fishTankId_key" ON "Plant"("fishTankId");
