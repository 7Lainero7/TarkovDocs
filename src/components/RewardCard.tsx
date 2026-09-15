"use client";

import { Plus, Minus, Trash2, Check, SkipForward, Trophy, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Image from "next/image";
import type { RewardStatus } from "@/types";

interface RewardData {
    id: string;
    order: number;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    requiredDocumentsCount: number;
}

interface DocumentData {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
}

interface RewardCardProps {
    reward: RewardData;
    documents: DocumentData[];
    status: RewardStatus;
    choices: Record<string, number>;
    onSetChoice: (docId: string, qty: number) => void;
    onRemoveChoice: (docId: string) => void;
    onResetChoices: () => void;
    onStatusChange: (status: RewardStatus) => void;
    documentCounts: Record<string, number>;
}

function hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return Math.abs(hash);
}

function getColorFromName(name: string): string {
    const colors = [
        "bg-red-500/20 text-red-400",
        "bg-blue-500/20 text-blue-400",
        "bg-green-500/20 text-green-400",
        "bg-yellow-500/20 text-yellow-400",
        "bg-purple-500/20 text-purple-400",
        "bg-pink-500/20 text-pink-400",
        "bg-indigo-500/20 text-indigo-400",
        "bg-orange-500/20 text-orange-400",
    ];
    return colors[hashCode(name) % colors.length];
}

export function RewardCard({
    reward,
    documents,
    status,
    choices,
    documentCounts,
    onSetChoice,
    onRemoveChoice,
    onResetChoices,
    onStatusChange,
}: RewardCardProps) {
    const totalSelected = Object.values(choices).reduce((sum, qty) => sum + qty, 0);
    const remaining = reward.requiredDocumentsCount - totalSelected;
    const isComplete = totalSelected === reward.requiredDocumentsCount;

    const rewardDeficit = Object.entries(choices).reduce((total, [docId, qty]) => {
        const available = documentCounts[docId] || 0;
        return total + Math.max(0, qty - available);
    }, 0);

    const availableDocs = documents.filter(doc => !(doc.id in choices));

    return (
        <Card
            className={`transition-all ${status === "claimed"
                ? "border-emerald-500/50 opacity-80"
                : status === "skipped"
                    ? "border-zinc-700 opacity-60"
                    : ""
                }`}
        >
            <div className="space-y-4">
                <div className="aspect-[16/9] bg-zinc-950 rounded-md overflow-hidden flex items-center justify-center">
                    {reward.imageUrl ? (
                        <Image
                            src={reward.imageUrl}
                            alt={reward.name}
                            width={400}
                            height={225}
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <Trophy size={48} className="text-zinc-700" />
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold">{reward.name}</h3>
                        <Badge variant={status === "claimed" ? "success" : status === "skipped" ? "default" : "warning"}>
                            {status === "claimed" ? "Получено" : status === "skipped" ? "Пропущено" : "Нужно"}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${isComplete ? "text-emerald-400" : "text-zinc-400"}`}>
                            {totalSelected}/{reward.requiredDocumentsCount} док.
                        </span>
                        {rewardDeficit > 0 ? (
                            <span className="text-xs text-rose-400">осталось собрать: {rewardDeficit}</span>
                        ) : isComplete ? (
                            <span className="text-xs text-emerald-400">всё собрано ✓</span>
                        ) : null}
                    </div>
                    {reward.description && (
                        <p className="text-sm text-zinc-500">{reward.description}</p>
                    )}
                </div>

                {Object.keys(choices).length > 0 && (
                    <div className="space-y-2 pt-4 border-t border-zinc-800">
                        {Object.entries(choices).map(([docId, qty]) => {
                            const doc = documents.find(d => d.id === docId);
                            if (!doc) return null;
                            return (
                                <div key={docId} className="flex items-center gap-2">
                                    {doc.imageUrl ? (
                                        <Image
                                            src={doc.imageUrl}
                                            alt={doc.name}
                                            width={40}
                                            height={40}
                                            className="rounded object-cover"
                                            title={doc.name}
                                        />
                                    ) : (
                                        <div
                                            className={`w-10 h-10 rounded flex items-center justify-center font-bold ${getColorFromName(doc.name)}`}
                                            title={doc.name}
                                        >
                                            {doc.name[0]}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm truncate" title={doc.name}>{doc.name}</p>
                                        {(() => {
                                            const available = documentCounts[docId] || 0;
                                            const missing = Math.max(0, qty - available);
                                            return missing > 0 ? (
                                                <p className="text-xs text-rose-400">не хватает {missing} (есть {available})</p>
                                            ) : (
                                                <p className="text-xs text-emerald-400">есть в наличии</p>
                                            );
                                        })()}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => qty > 1 ? onSetChoice(docId, qty - 1) : onRemoveChoice(docId)}
                                            className="w-6 h-6 flex items-center justify-center bg-zinc-800 rounded hover:bg-zinc-700 transition-colors"
                                        >
                                            <Minus size={12} />
                                        </button>
                                        <span className="text-sm font-bold w-6 text-center">{qty}</span>
                                        <button
                                            onClick={() => onSetChoice(docId, qty + 1)}
                                            disabled={remaining <= 0}
                                            className="w-6 h-6 flex items-center justify-center bg-zinc-800 rounded hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Plus size={12} />
                                        </button>
                                        <button
                                            onClick={() => onRemoveChoice(docId)}
                                            className="w-6 h-6 flex items-center justify-center text-rose-400 hover:text-rose-300 transition-colors"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {remaining > 0 && availableDocs.length > 0 && (
                    <div className="pt-4 border-t border-zinc-800">
                        <label className="block text-xs text-zinc-500 mb-2">Добавить документ:</label>
                        <select
                            onChange={(e) => {
                                if (e.target.value) {
                                    onSetChoice(e.target.value, 1);
                                    e.target.value = "";
                                }
                            }}
                            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-sm focus:outline-none focus:border-amber-500"
                            defaultValue=""
                        >
                            <option value="" disabled>Выберите документ</option>
                            {availableDocs.map(doc => (
                                <option key={doc.id} value={doc.id}>{doc.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="flex gap-2 pt-4 border-t border-zinc-800">
                    <Button
                        variant={status === "claimed" ? "primary" : "secondary"}
                        size="sm"
                        onClick={() => onStatusChange(status === "claimed" ? "needed" : "claimed")}
                        icon={status === "claimed" ? <RotateCcw size={12} /> : <Check size={12} />}
                        className="flex-1"
                    >
                        {status === "claimed" ? "Отменить" : "Получено"}
                    </Button>
                    <Button
                        variant={status === "skipped" ? "primary" : "ghost"}
                        size="sm"
                        onClick={() => onStatusChange(status === "skipped" ? "needed" : "skipped")}
                        icon={<SkipForward size={12} />}
                        className="flex-1"
                    >
                        {status === "skipped" ? "Отменить" : "Пропустить"}
                    </Button>
                </div>

                {Object.keys(choices).length > 0 && (
                    <button
                        onClick={onResetChoices}
                        className="text-xs text-zinc-500 hover:text-rose-400 transition-colors"
                    >
                        Сбросить выбор документов
                    </button>
                )}
            </div>
        </Card>
    );
}