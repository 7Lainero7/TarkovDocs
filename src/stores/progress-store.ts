import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RewardStatus } from "@/types";

interface ProgressState {
  rewardStatuses: Record<string, RewardStatus>;
  documentCounts: Record<string, number>;
  rewardDocumentChoices: Record<string, Record<string, number>>;
  
  setRewardStatus: (rewardId: string, status: RewardStatus) => void;
  setDocumentCount: (documentId: string, count: number) => void;
  setRewardDocumentChoice: (rewardId: string, documentId: string, quantity: number) => void;
  removeRewardDocumentChoice: (rewardId: string, documentId: string) => void;
  resetRewardChoices: (rewardId: string) => void;
  exportProgress: () => string;
  importProgress: (json: string) => boolean;
  resetProgress: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      rewardStatuses: {},
      documentCounts: {},
      rewardDocumentChoices: {},

      setRewardStatus: (rewardId, status) =>
        set((state) => ({
          rewardStatuses: {
            ...state.rewardStatuses,
            [rewardId]: status,
          },
        })),

      setDocumentCount: (documentId, count) =>
        set((state) => ({
          documentCounts: {
            ...state.documentCounts,
            [documentId]: count,
          },
        })),

      setRewardDocumentChoice: (rewardId, documentId, quantity) =>
        set((state) => ({
          rewardDocumentChoices: {
            ...state.rewardDocumentChoices,
            [rewardId]: {
              ...(state.rewardDocumentChoices[rewardId] || {}),
              [documentId]: quantity,
            },
          },
        })),

      removeRewardDocumentChoice: (rewardId, documentId) =>
        set((state) => {
          const choices = { ...(state.rewardDocumentChoices[rewardId] || {}) };
          delete choices[documentId];
          return {
            rewardDocumentChoices: {
              ...state.rewardDocumentChoices,
              [rewardId]: choices,
            },
          };
        }),

      resetRewardChoices: (rewardId) =>
        set((state) => {
          const choices = { ...state.rewardDocumentChoices };
          delete choices[rewardId];
          return { rewardDocumentChoices: choices };
        }),

      exportProgress: () => {
        const state = get();
        return JSON.stringify({
          version: "2.0",
          exportedAt: new Date().toISOString(),
          rewardStatuses: state.rewardStatuses,
          documentCounts: state.documentCounts,
          rewardDocumentChoices: state.rewardDocumentChoices,
        }, null, 2);
      },

      importProgress: (json: string) => {
        try {
          const data = JSON.parse(json);
          if (!data.version) return false;
          set({
            rewardStatuses: data.rewardStatuses || {},
            documentCounts: data.documentCounts || {},
            rewardDocumentChoices: data.rewardDocumentChoices || {},
          });
          return true;
        } catch {
          return false;
        }
      },

      resetProgress: () =>
        set({
          rewardStatuses: {},
          documentCounts: {},
          rewardDocumentChoices: {},
        }),
    }),
    {
      name: "tarkovdocs-progress",
    }
  )
);