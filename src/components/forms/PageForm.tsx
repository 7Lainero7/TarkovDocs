"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PageFormProps {
  seasonId: string;
  defaultNumber?: number;
  initialData?: {
    id?: string;
    number?: number;
    title?: string;
    slug?: string;
  };
}

export function PageForm({ seasonId, defaultNumber, initialData }: PageFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData?.id);

  const [number, setNumber] = useState(initialData?.number || defaultNumber || 1);
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const generateSlug = (value: string) => {
    return value
      .toLowerCase()
      .replace(/[^a-zа-яё0-9\s-]/gi, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
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
        ? `/api/admin/pages/${initialData!.id}`
        : `/api/admin/pages`;

      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seasonId,
          number,
          title,
          slug,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ошибка сохранения");
        return;
      }

      router.push(`/admin/seasons/${seasonId}`);
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="number" className="block text-sm font-medium mb-2">
              Номер страницы *
            </label>
            <input
              id="number"
              type="number"
              min={1}
              value={number}
              onChange={(e) => setNumber(parseInt(e.target.value) || 1)}
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
              placeholder="page-1"
              className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-md focus:outline-none focus:border-amber-500 transition-colors font-mono text-sm"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Название страницы *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Например: Страница 1"
            className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-md focus:outline-none focus:border-amber-500 transition-colors"
            required
            disabled={loading}
          />
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
          disabled={loading || !title || !slug}
          className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Сохранение..." : isEditing ? "Сохранить" : "Создать страницу"}
        </button>
        <Link
          href={`/admin/seasons/${seasonId}`}
          className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors"
        >
          Отмена
        </Link>
      </div>
    </form>
  );
}