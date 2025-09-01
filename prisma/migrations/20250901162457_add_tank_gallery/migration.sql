-- CreateTable
CREATE TABLE "TankGallery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT,
    "description" TEXT,
    "imageUrl" TEXT NOT NULL,
    "altText" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "fishTankId" TEXT NOT NULL,
    CONSTRAINT "TankGallery_fishTankId_fkey" FOREIGN KEY ("fishTankId") REFERENCES "FishTank" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "TankGallery_fishTankId_idx" ON "TankGallery"("fishTankId");

-- CreateIndex
CREATE INDEX "TankGallery_fishTankId_createdAt_idx" ON "TankGallery"("fishTankId", "createdAt");
