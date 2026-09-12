"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SeasonFormProps {
    initialData?: {
        id?: string;
        name?: string;
        slug?: string;
        description?: string;
        isActive?: boolean;
    };
}

export function SeasonForm({ initialData }: SeasonFormProps) {
    const router = useRouter();
    const isEditing = Boolean(initialData?.id);

    const [name, setName] = useState(initialData?.name || "");
    const [slug, setSlug] = useState(initialData?.slug || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [isActive, setIsActive] = useState(initialData?.isActive || false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Автоматически генерируем slug из названия
    const generateSlug = (value: string) => {
        return value
            .toLowerCase()
            .replace(/[^a-zа-яё0-9\s-]/gi, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim();
    };

    const handleNameChange = (value: string) => {
        setName(value);
        // Генерируем slug только если пользователь не ввёл его вручную
        if (!initialData?.slug && !slug) {
            setSlug(generateSlug(value));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const url = isEditing
                ? `/api/admin/seasons/${initialData!.id}`
                : "/api/admin/seasons";

            const method = isEditing ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, slug, description, isActive }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Ошибка сохранения");
                return;
            }

            router.push("/admin/seasons");
            router.refresh();
        } catch {
            setError("Ошибка сети");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                        Название сезона *
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="Например: Сезонный пропуск 2025"
                        className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-md focus:outline-none focus:border-amber-500 transition-colors"
                        required
                        disabled={loading}
                    />
                </div>

                <div>
                    <label htmlFor="slug" className="block text-sm font-medium mb-2">
                        Slug (URL) *
                    </label>
                    <input
                        id="slug"
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="season-2025"
                        className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-md focus:outline-none focus:border-amber-500 transition-colors font-mono text-sm"
                        required
                        disabled={loading}
                    />
                    <p className="text-xs text-zinc-500 mt-1">
                        Используется в адресе страницы: /season/[slug]
                    </p>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-2">
                        Описание
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Краткое описание сезонного пропуска"
                        rows={3}
                        className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-md focus:outline-none focus:border-amber-500 transition-colors resize-none"
                        disabled={loading}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <input
                        id="isActive"
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="w-4 h-4 accent-amber-500"
                        disabled={loading}
                    />
                    <label htmlFor="isActive" className="text-sm font-medium">
                        Активный сезон (показывать на главной)
                    </label>
                </div>
            </div>

            {error && (
                <div className="text-rose-500 text-sm bg-rose-500/10 border border-rose-500/20 rounded px-3 py-2">
                    {error}
                </div>
            )}

            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={loading || !name || !slug}
                    className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Сохранение..." : isEditing ? "Сохранить" : "Создать сезон"}
                </button>
                <Link
                    href="/admin/seasons"
                    className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors"
                >
                    Отмена
                </Link>
            </div>
        </form>
    );
}