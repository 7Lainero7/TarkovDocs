/*
  Warnings:

  - You are about to drop the column `seasonId` on the `Location` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Location` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Location" DROP CONSTRAINT "Location_seasonId_fkey";

-- DropIndex
DROP INDEX "Location_seasonId_slug_key";

-- AlterTable
ALTER TABLE "Location" DROP COLUMN "seasonId";

-- CreateIndex
CREATE UNIQUE INDEX "Location_slug_key" ON "Location"("slug");
