-- CreateTable
CREATE TABLE "FishTankParameterLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "calcium" INTEGER,
    "alk" REAL,
    "magnesium" INTEGER,
    "pH" REAL,
    "temp" REAL,
    "nitrate" REAL,
    "phosphate" REAL,
    "fishTankId" TEXT,
    CONSTRAINT "FishTankParameterLog_fishTankId_fkey" FOREIGN KEY ("fishTankId") REFERENCES "FishTank" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
