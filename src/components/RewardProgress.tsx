"use client";

import { Check, X, SkipForward, RotateCcw } from "lucide-react";
import { useProgressStore } from "@/stores/progress-store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import Image from "next/image";
import type { RewardStatus } from "@/types";

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

interface RewardProgressProps {
  season: SeasonData;
}

export function RewardProgress({ season }: RewardProgressProps) {
  const { rewardStatuses, setRewardStatus, documentCounts, setDocumentCount, rewardDocumentChoices } = useProgressStore();

  // Подсчёт баланса документов
  const documentBalance: Record<string, { needed: number; available: number; deficit: number }> = {};

  for (const page of season.pages) {
    for (const reward of page.rewards) {
      const status = rewardStatuses[reward.id] || "needed";
      if (status === "needed" || status === "claimed") {
        const choices = rewardDocumentChoices[reward.id] || {};
        for (const [docId, qty] of Object.entries(choices)) {
          if (!documentBalance[docId]) {
            documentBalance[docId] = { needed: 0, available: documentCounts[docId] || 0, deficit: 0 };
          }
          documentBalance[docId].needed += qty;
        }
      }
    }
  }

  for (const docId in documentBalance) {
    documentBalance[docId].available = documentCounts[docId] || 0;
    documentBalance[docId].deficit = Math.max(0, documentBalance[docId].needed - documentBalance[docId].available);
  }

  return (
    <div className="space-y-8">
      {/* Баланс документов */}
      <Card>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          📄 Мои документы
        </h2>
        <p className="text-sm text-zinc-400 mb-4">
          Укажите, сколько документов каждого типа у вас есть
        </p>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {season.documents.map((doc) => {
            const balance = documentBalance[doc.id];
            const count = documentCounts[doc.id] || 0;
            return (
              <div key={doc.id} className="flex items-center justify-between bg-zinc-800/50 rounded-md px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{doc.name}</p>
                  {balance && balance.needed > 0 && (
                    <p className={`text-xs ${balance.deficit > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                      Нужно: {balance.needed} • Есть: {count}
                      {balance.deficit > 0 && ` • Не хватает: ${balance.deficit}`}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={99}
                    value={count}
                    onChange={(e) => setDocumentCount(doc.id, parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 bg-zinc-950 border border-zinc-700 rounded text-center text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Награды по страницам */}
      {season.pages.map((page) => (
        <div key={page.id}>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <span className="w-8 h-8 bg-zinc-800 rounded flex items-center justify-center text-sm font-bold text-zinc-400">
              {page.number}
            </span>
            {page.title}
          </h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {page.rewards.map((reward) => {
              const status = rewardStatuses[reward.id] || "needed";
              const choices = rewardDocumentChoices[reward.id] || {};
              const hasChoices = Object.keys(choices).length > 0;

              return (
                <Card
                  key={reward.id}
                  className={`transition-all ${
                    status === "claimed"
                      ? "border-emerald-500/50 opacity-80"
                      : status === "skipped"
                      ? "border-zinc-700 opacity-50"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {reward.imageUrl ? (
                        <Image src={reward.imageUrl} alt={reward.name} width={40} height={40} className="rounded border border-zinc-800" />
                      ) : (
                        <div className="w-10 h-10 bg-zinc-800 rounded flex items-center justify-center text-zinc-500 font-bold text-sm">
                          {reward.order}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-sm">{reward.name}</h3>
                        <p className="text-xs text-zinc-500">
                          {hasChoices
                            ? Object.entries(choices).map(([docId, qty]) => {
                                const doc = season.documents.find(d => d.id === docId);
                                return doc ? `${doc.name} ×${qty}` : "";
                              }).filter(Boolean).join(", ")
                            : "Документы не выбраны"}
                        </p>
                      </div>
                    </div>
                    <Badge variant={status === "claimed" ? "success" : status === "skipped" ? "default" : "warning"}>
                      {status === "claimed" ? "Получено" : status === "skipped" ? "Пропущено" : "Нужно"}
                    </Badge>
                  </div>

                  {/* Кнопки статуса */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-zinc-800">
                    <Button
                      variant={status === "claimed" ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => setRewardStatus(reward.id, status === "claimed" ? "needed" : "claimed")}
                      icon={status === "claimed" ? <RotateCcw size={12} /> : <Check size={12} />}
                      className="flex-1"
                    >
                      {status === "claimed" ? "Отменить" : "Получено"}
                    </Button>
                    <Button
                      variant={status === "skipped" ? "primary" : "ghost"}
                      size="sm"
                      onClick={() => setRewardStatus(reward.id, status === "skipped" ? "needed" : "skipped")}
                      icon={<SkipForward size={12} />}
                      className="flex-1"
                    >
                      {status === "skipped" ? "Отменить" : "Пропустить"}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}