-- DropIndex
DROP INDEX "Reward_pageId_slug_key";

-- AlterTable
ALTER TABLE "Reward" ADD COLUMN     "requiredDocumentsCount" INTEGER NOT NULL DEFAULT 3;
