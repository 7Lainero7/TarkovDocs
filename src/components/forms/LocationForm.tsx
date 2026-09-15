"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { generateSlug } from "@/lib/utils";

interface LocationFormProps {
  initialData?: {
    id?: string;
    name?: string;
    slug?: string;
    description?: string;
  };
}

export function LocationForm({ initialData }: LocationFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData?.id);

  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!initialData?.slug);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugManuallyEdited) {
      setSlug(generateSlug(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlug(value);
    setSlugManuallyEdited(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const url = isEditing
        ? `/api/admin/locations/${initialData!.id}`
        : `/api/admin/locations`;

      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          description: description || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ошибка сохранения");
        return;
      }

      router.push("/admin/locations");
      router.refresh();
    } catch {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <Card>
        <div className="space-y-4">
          <Input
            label="Название локации *"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Например: Таможня"
            required
            disabled={loading}
          />

          <Input
            label="Slug (URL) *"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="customs"
            required
            disabled={loading}
            className="font-mono text-sm"
          />

          <div className="space-y-1.5">
            <label htmlFor="description" className="block text-sm font-medium text-zinc-300">
              Описание
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Описание локации"
              rows={3}
              className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors resize-none disabled:opacity-50"
              disabled={loading}
            />
          </div>
        </div>
      </Card>

      {error && (
        <div className="text-rose-500 text-sm bg-rose-500/10 border border-rose-500/20 rounded px-3 py-2">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" isLoading={loading} disabled={!name || !slug}>
          {isEditing ? "Сохранить" : "Создать локацию"}
        </Button>
        <Link href="/admin/locations">
          <Button variant="secondary" type="button">Отмена</Button>
        </Link>
      </div>
    </form>
  );
}