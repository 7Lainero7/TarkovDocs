"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Lock, Check, Download, Upload, RotateCcw } from "lucide-react";
import { useProgressStore } from "@/stores/progress-store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RewardCard } from "./RewardCard";
import { calculateDocumentBalance, isPageUnlocked } from "@/lib/calculations";
import Image from "next/image";

interface SeasonData {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    pages: {
        id: string;
        number: number;
        title: string;
        slug: string;
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

interface SeasonViewProps {
    season: SeasonData;
}

export function SeasonView({ season }: SeasonViewProps) {
    const [currentPage, setCurrentPage] = useState(0);
    const {
        rewardStatuses,
        documentCounts,
        rewardDocumentChoices,
        setRewardStatus,
        setDocumentCount,
        setRewardDocumentChoice,
        removeRewardDocumentChoice,
        resetRewardChoices,
        exportProgress,
        importProgress,
        resetProgress,
    } = useProgressStore();

    const allRewards = useMemo(() => {
        return season.pages.flatMap(page =>
            page.rewards.map(reward => ({
                ...reward,
                status: rewardStatuses[reward.id] || "needed",
            }))
        );
    }, [season.pages, rewardStatuses]);

    const balance = useMemo(() => {
        return calculateDocumentBalance(allRewards, rewardDocumentChoices, documentCounts);
    }, [allRewards, rewardDocumentChoices, documentCounts]);

    const totalRewards = allRewards.length;
    const claimedRewards = allRewards.filter(r => r.status === "claimed").length;
    const skippedRewards = allRewards.filter(r => r.status === "skipped").length;

    const totalDeficit = Object.values(balance).reduce((sum, b) => sum + b.deficit, 0);

    const handleExport = () => {
        const json = exportProgress();
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `tarkovdocs-progress-${season.slug}-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImport = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                const text = ev.target?.result as string;
                const success = importProgress(text);
                if (success) {
                    alert("Прогресс успешно загружен!");
                } else {
                    alert("Ошибка: неверный формат файла");
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    const handleReset = () => {
        if (confirm("Сбросить весь прогресс? Это действие необратимо.")) {
            resetProgress();
        }
    };

    const isPageAccessible = (pageIndex: number): boolean => {
        if (pageIndex === 0) return true;
        const prevPage = season.pages[pageIndex - 1];
        const prevRewardsWithStatus = prevPage.rewards.map(r => ({
            ...r,
            status: rewardStatuses[r.id] || "needed",
        }));
        const claimedOnPrevPage = prevRewardsWithStatus.filter(r => r.status === "claimed").length;
        return isPageUnlocked(prevRewardsWithStatus, claimedOnPrevPage);
    };

    const isPageComplete = (pageIndex: number): boolean => {
        const page = season.pages[pageIndex];
        return page.rewards.every(r => rewardStatuses[r.id] === "claimed");
    };

    const currentPageData = season.pages[currentPage];

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 xl:grid-cols-[160px_1fr_160px] gap-8">
                <div className="hidden xl:block">
                    <div className="sticky top-24 bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center text-zinc-500 text-sm h-[600px] flex items-center justify-center">
                        Рекламный блок
                    </div>
                </div>

                <div className="space-y-8">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">{season.name}</h1>
                        {season.description && (
                            <p className="text-zinc-400">{season.description}</p>
                        )}
                    </div>

                    <Card>
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="text-zinc-300">
                                            Получено наград: <span className="font-bold text-amber-500">{claimedRewards}</span>/{totalRewards}
                                        </span>
                                        <span className="text-zinc-500">Пропущено: {skippedRewards}</span>
                                    </div>
                                    <div className="w-64 h-2 bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-amber-500 transition-all"
                                            style={{ width: `${totalRewards > 0 ? (claimedRewards / totalRewards) * 100 : 0}%` }}
                                        />
                                    </div>
                                    {totalDeficit > 0 && (
                                        <div className="text-xs text-rose-400">
                                            Общий дефицит документов: {totalDeficit}
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="secondary" size="sm" onClick={handleExport} icon={<Download size={14} />}>
                                        Сохранить
                                    </Button>
                                    <Button variant="secondary" size="sm" onClick={handleImport} icon={<Upload size={14} />}>
                                        Загрузить
                                    </Button>
                                    <Button variant="danger" size="sm" onClick={handleReset} icon={<RotateCcw size={14} />}>
                                        Сброс
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <h2 className="text-xl font-bold mb-4">Мои документы</h2>
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {season.documents.map((doc) => {
                                const docBalance = balance[doc.id];
                                const count = documentCounts[doc.id] || 0;
                                return (
                                    <div key={doc.id} className="flex items-center gap-3 bg-zinc-800/50 rounded-md p-3">
                                        {doc.imageUrl ? (
                                            <Image
                                                src={doc.imageUrl}
                                                alt={doc.name}
                                                width={40}
                                                height={40}
                                                className="rounded object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 bg-zinc-700 rounded flex items-center justify-center text-zinc-400 font-bold">
                                                {doc.name[0]}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{doc.name}</p>
                                            {docBalance && docBalance.needed > 0 && (
                                                <p className={`text-xs ${docBalance.deficit > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                                                    Нужно: {docBalance.needed} • Не хватает: {docBalance.deficit}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => setDocumentCount(doc.id, Math.max(0, count - 1))}
                                                className="w-7 h-7 flex items-center justify-center bg-zinc-800 rounded hover:bg-zinc-700 transition-colors text-zinc-300"
                                            >
                                                −
                                            </button>
                                            <input
                                                type="number"
                                                min={0}
                                                max={99}
                                                value={count}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value, 10);
                                                    setDocumentCount(doc.id, isNaN(val) ? 0 : Math.max(0, Math.min(99, val)));
                                                }}
                                                className="w-10 h-7 text-center text-sm font-bold bg-zinc-950 border border-zinc-700 rounded focus:outline-none focus:border-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setDocumentCount(doc.id, Math.min(99, count + 1))}
                                                className="w-7 h-7 flex items-center justify-center bg-zinc-800 rounded hover:bg-zinc-700 transition-colors text-zinc-300"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                disabled={currentPage === 0}
                                icon={<ChevronLeft size={16} />}
                            />
                            <div className="flex-1 flex gap-2 overflow-x-auto">
                                {season.pages.map((page, index) => {
                                    const accessible = isPageAccessible(index);
                                    const complete = isPageComplete(index);
                                    return (
                                        <button
                                            key={page.id}
                                            onClick={() => accessible && setCurrentPage(index)}
                                            disabled={!accessible}
                                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${currentPage === index
                                                ? "bg-amber-500 text-zinc-900"
                                                : accessible
                                                    ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                                                    : "bg-zinc-900 text-zinc-600 cursor-not-allowed"
                                                }`}
                                        >
                                            {!accessible ? (
                                                <Lock size={14} className="inline mr-1" />
                                            ) : complete ? (
                                                <Check size={14} className="inline mr-1" />
                                            ) : null}
                                            {page.number}
                                        </button>
                                    );
                                })}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCurrentPage(Math.min(season.pages.length - 1, currentPage + 1))}
                                disabled={currentPage === season.pages.length - 1}
                                icon={<ChevronRight size={16} />}
                            />
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold mb-4">{currentPageData.title}</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                {currentPageData.rewards.map((reward) => (
                                    <RewardCard
                                        key={reward.id}
                                        reward={reward}
                                        documents={season.documents}
                                        status={rewardStatuses[reward.id] || "needed"}
                                        choices={rewardDocumentChoices[reward.id] || {}}
                                        onSetChoice={(docId, qty) => setRewardDocumentChoice(reward.id, docId, qty)}
                                        onRemoveChoice={(docId) => removeRewardDocumentChoice(reward.id, docId)}
                                        onResetChoices={() => resetRewardChoices(reward.id)}
                                        onStatusChange={(status) => setRewardStatus(reward.id, status)}
                                        documentCounts={documentCounts}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>


                </div>

                <div className="hidden xl:block">
                    <div className="sticky top-24 bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center text-zinc-500 text-sm h-[600px] flex items-center justify-center">
                        Рекламный блок
                    </div>
                </div>
            </div>
        </div>
    );
}