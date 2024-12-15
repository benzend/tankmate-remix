-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FishTank" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "waterType" TEXT NOT NULL,
    "dimensionsLength" INTEGER,
    "dimensionsWidth" INTEGER,
    "dimensionsHeight" INTEGER,
    "volume" INTEGER,
    "userId" TEXT NOT NULL,
    CONSTRAINT "FishTank_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FishTank" ("createdAt", "dimensionsHeight", "dimensionsLength", "dimensionsWidth", "id", "name", "updatedAt", "userId", "waterType") SELECT "createdAt", "dimensionsHeight", "dimensionsLength", "dimensionsWidth", "id", "name", "updatedAt", "userId", "waterType" FROM "FishTank";
DROP TABLE "FishTank";
ALTER TABLE "new_FishTank" RENAME TO "FishTank";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
