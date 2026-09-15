"use client";

import { useState } from "react";
import { Minus, Plus, Check, X } from "lucide-react";
import { useProgressStore } from "@/stores/progress-store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Image from "next/image";

interface SeasonData {
  id: string;
  pages: {
    id: string;
    number: number;
    title: string;
    rewards: {
      id: string;
      order: number;
      name: string;
      slug: string;
      description: string | null;
      imageUrl: string | null;
      requiredDocumentsCount: number;
    }[];
  }[];
  documents: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
  }[];
}

interface RewardConfiguratorProps {
  season: SeasonData;
}

export function RewardConfigurator({ season }: RewardConfiguratorProps) {
  const { rewardDocumentChoices, setRewardDocumentChoice, removeRewardDocumentChoice, resetRewardChoices } = useProgressStore();

  return (
    <div className="space-y-8">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <p className="text-sm text-zinc-400">
          💡 Выберите, какие документы вам нужны для каждой награды. 
          Общее количество документов для каждой награды фиксировано.
        </p>
      </div>

      {season.pages.map((page) => (
        <div key={page.id}>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <span className="w-8 h-8 bg-zinc-800 rounded flex items-center justify-center text-sm font-bold text-zinc-400">
              {page.number}
            </span>
            {page.title}
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {page.rewards.map((reward) => (
              <RewardConfigCard
                key={reward.id}
                reward={reward}
                documents={season.documents}
                choices={rewardDocumentChoices[reward.id] || {}}
                onSetChoice={(docId, qty) => setRewardDocumentChoice(reward.id, docId, qty)}
                onRemoveChoice={(docId) => removeRewardDocumentChoice(reward.id, docId)}
                onReset={() => resetRewardChoices(reward.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface RewardConfigCardProps {
  reward: {
    id: string;
    order: number;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    requiredDocumentsCount: number;
  };
  documents: { id: string; name: string; slug: string; imageUrl: string | null }[];
  choices: Record<string, number>;
  onSetChoice: (docId: string, qty: number) => void;
  onRemoveChoice: (docId: string) => void;
  onReset: () => void;
}

function RewardConfigCard({ reward, documents, choices, onSetChoice, onRemoveChoice, onReset }: RewardConfigCardProps) {
  const totalSelected = Object.values(choices).reduce((sum, qty) => sum + qty, 0);
  const remaining = reward.requiredDocumentsCount - totalSelected;
  const isComplete = totalSelected === reward.requiredDocumentsCount;
  const isOver = totalSelected > reward.requiredDocumentsCount;

  return (
    <Card className={isComplete ? "border-emerald-500/50" : isOver ? "border-rose-500/50" : ""}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {reward.imageUrl ? (
            <Image src={reward.imageUrl} alt={reward.name} width={48} height={48} className="rounded-md border border-zinc-800" />
          ) : (
            <div className="w-12 h-12 bg-zinc-800 rounded-md flex items-center justify-center text-zinc-500 font-bold">
              {reward.order}
            </div>
          )}
          <div>
            <h3 className="font-bold">{reward.name}</h3>
            <p className="text-sm text-zinc-500">
              Нужно: {reward.requiredDocumentsCount} док.
            </p>
          </div>
        </div>
        <Badge variant={isComplete ? "success" : isOver ? "danger" : "default"}>
          {totalSelected}/{reward.requiredDocumentsCount}
        </Badge>
      </div>

      {/* Выбранные документы */}
      {Object.keys(choices).length > 0 && (
        <div className="space-y-2 mb-4">
          {Object.entries(choices).map(([docId, qty]) => {
            const doc = documents.find(d => d.id === docId);
            if (!doc) return null;
            return (
              <div key={docId} className="flex items-center justify-between bg-zinc-800/50 rounded px-3 py-2">
                <span className="text-sm">{doc.name}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => qty > 1 ? onSetChoice(docId, qty - 1) : onRemoveChoice(docId)}
                    className="w-6 h-6 flex items-center justify-center bg-zinc-700 rounded hover:bg-zinc-600"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-sm font-bold w-6 text-center">{qty}</span>
                  <button
                    onClick={() => onSetChoice(docId, qty + 1)}
                    disabled={remaining <= 0}
                    className="w-6 h-6 flex items-center justify-center bg-zinc-700 rounded hover:bg-zinc-600 disabled:opacity-50"
                  >
                    <Plus size={12} />
                  </button>
                  <button
                    onClick={() => onRemoveChoice(docId)}
                    className="w-6 h-6 flex items-center justify-center text-rose-400 hover:text-rose-300"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Доступные для добавления документы */}
      {remaining > 0 && (
        <div className="border-t border-zinc-800 pt-3">
          <p className="text-xs text-zinc-500 mb-2">Добавить документ:</p>
          <div className="flex flex-wrap gap-1">
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => onSetChoice(doc.id, (choices[doc.id] || 0) + 1)}
                className="text-xs px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded border border-zinc-700 hover:border-amber-500/50 transition-colors"
              >
                + {doc.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Кнопка сброса */}
      {Object.keys(choices).length > 0 && (
        <button
          onClick={onReset}
          className="mt-3 text-xs text-zinc-500 hover:text-rose-400 transition-colors"
        >
          Сбросить выбор
        </button>
      )}
    </Card>
  );
}