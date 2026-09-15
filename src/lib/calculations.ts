export type RewardStatus = "needed" | "claimed" | "skipped";

export interface RewardWithStatus {
  id: string;
  status: RewardStatus;
  requiredDocumentsCount: number;
}

export function calculateUnlockRequirement(totalRewards: number): number {
  return Math.max(0, totalRewards - 1);
}

export function isPageUnlocked(
  prevPageRewards: RewardWithStatus[],
  claimedCount: number
): boolean {
  if (prevPageRewards.length === 0) return true;
  const required = calculateUnlockRequirement(prevPageRewards.length);
  return claimedCount >= required;
}

export function calculateDocumentBalance(
  rewards: RewardWithStatus[],
  rewardDocumentChoices: Record<string, Record<string, number>>,
  documentCounts: Record<string, number>
): Record<string, { needed: number; available: number; deficit: number }> {
  const balance: Record<string, { needed: number; available: number; deficit: number }> = {};

  for (const reward of rewards) {
    if (reward.status === "needed" || reward.status === "claimed") {
      const choices = rewardDocumentChoices[reward.id] || {};
      for (const [docId, qty] of Object.entries(choices)) {
        if (!balance[docId]) {
          balance[docId] = { needed: 0, available: documentCounts[docId] || 0, deficit: 0 };
        }
        balance[docId].needed += qty;
      }
    }
  }

  for (const docId in balance) {
    balance[docId].available = documentCounts[docId] || 0;
    balance[docId].deficit = Math.max(0, balance[docId].needed - balance[docId].available);
  }

  return balance;
}

export function isRewardComplete(
  rewardId: string,
  requiredDocumentsCount: number,
  rewardDocumentChoices: Record<string, Record<string, number>>
): boolean {
  const choices = rewardDocumentChoices[rewardId] || {};
  const total = Object.values(choices).reduce((sum, qty) => sum + qty, 0);
  return total === requiredDocumentsCount;
}