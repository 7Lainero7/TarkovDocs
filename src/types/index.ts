export type RewardStatus = "needed" | "claimed" | "skipped";

export interface DocumentBalance {
  needed: number;
  available: number;
  deficit: number;
}

export interface UserProgress {
  seasonId: string;
  rewardStatuses: Record<string, RewardStatus>;
  documentCounts: Record<string, number>;
  rewardDocumentChoices: Record<string, Record<string, number>>;
}