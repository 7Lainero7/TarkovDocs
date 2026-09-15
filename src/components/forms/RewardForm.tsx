"use client";
import { useState, FormEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Upload, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { generateSlug } from "@/lib/utils";
import Image from "next/image";

interface RewardFormProps {
  pageId: string;
  defaultOrder?: number;
  initialData?: {
    id?: string;
    order?: number;
    name?: string;
    slug?: string;
    description?: string;
    imageUrl?: string;
    requiredDocumentsCount?: number;
  };
}

export function RewardForm({ pageId, defaultOrder, initialData }: RewardFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData?.id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [order, setOrder] = useState(initialData?.order || defaultOrder || 1);
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [requiredDocumentsCount, setRequiredDocumentsCount] = useState(
    initialData?.requiredDocumentsCount || 3
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Ошибка загрузки"); return; }
      setImageUrl(data.url);
    } catch { setError("Ошибка сети"); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const url = isEditing ? `/api/admin/rewards/${initialData!.id}` : `/api/admin/rewards`;
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId,
          order,
          name,
          slug,
          description: description || undefined,
          imageUrl: imageUrl || undefined,
          requiredDocumentsCount,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Ошибка сохранения"); return; }
      router.push(`/admin/pages/${pageId}`);
      router.refresh();
    } catch { setError("Ошибка сети"); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Порядок *"
              type="number"
              min={1}
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
              required
              disabled={loading}
            />
            <Input
              label="Slug (URL) *"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="reward-1"
              required
              disabled={loading}
              className="font-mono text-sm"
            />
          </div>
          <Input
            label="Название награды *"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Например: Рюкзак"
            required
            disabled={loading}
          />
          <Input
            label="Сколько документов нужно *"
            type="number"
            min={1}
            max={10}
            value={requiredDocumentsCount}
            onChange={(e) => setRequiredDocumentsCount(parseInt(e.target.value) || 3)}
            required
            disabled={loading}
            helperText="Общее количество документов, которые игрок должен выбрать для этой награды"
          />
          <div className="space-y-1.5">
            <label htmlFor="description" className="block text-sm font-medium text-zinc-300">
              Описание
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Описание награды"
              rows={3}
              className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors resize-none disabled:opacity-50"
              disabled={loading}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300">Изображение</label>
            {imageUrl ? (
              <div className="relative inline-block">
                <Image src={imageUrl} alt="Preview" width={200} height={200} className="rounded-md border border-zinc-800" />
                <button type="button" onClick={() => setImageUrl("")} className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 hover:bg-rose-600 rounded-full flex items-center justify-center transition-colors">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-zinc-700 rounded-md p-8 text-center cursor-pointer hover:border-amber-500/50 transition-colors">
                <Upload className="mx-auto mb-2 text-zinc-500" size={24} />
                <p className="text-sm text-zinc-400">{uploading ? "Загрузка..." : "Нажмите для загрузки изображения"}</p>
                <p className="text-xs text-zinc-500 mt-1">JPEG, PNG, WebP, GIF (макс. 5MB)</p>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={uploading || loading} />
          </div>
        </div>
      </Card>

      {error && (
        <div className="text-rose-500 text-sm bg-rose-500/10 border border-rose-500/20 rounded px-3 py-2">{error}</div>
      )}
      <div className="flex gap-3">
        <Button type="submit" isLoading={loading} disabled={!name || !slug}>
          {isEditing ? "Сохранить" : "Создать награду"}
        </Button>
        <Link href={`/admin/pages/${pageId}`}>
          <Button variant="secondary" type="button">Отмена</Button>
        </Link>
      </div>
    </form>
  );
}