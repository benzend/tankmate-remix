-- AlterTable
ALTER TABLE "User" ADD COLUMN "subscriptionId" TEXT;
ALTER TABLE "User" ADD COLUMN "subscriptionStatus" TEXT DEFAULT 'inactive';
