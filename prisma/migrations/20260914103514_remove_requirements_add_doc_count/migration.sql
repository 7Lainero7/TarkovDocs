/*
  Warnings:

  - You are about to drop the `RewardRequirement` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RewardRequirement" DROP CONSTRAINT "RewardRequirement_documentId_fkey";

-- DropForeignKey
ALTER TABLE "RewardRequirement" DROP CONSTRAINT "RewardRequirement_rewardId_fkey";

-- DropTable
DROP TABLE "RewardRequirement";
