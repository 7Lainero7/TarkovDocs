"use client";
import { useState, FormEvent, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Upload, X, Plus, Trash2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { generateSlug } from "@/lib/utils";
import Image from "next/image";

interface Location {
  id: string;
  name: string;
}

interface SpawnEntry {
  locationId: string;
  note: string;
}

interface DocumentFormProps {
  seasonId: string;
  initialData?: {
    id?: string;
    name?: string;
    slug?: string;
    description?: string;
    imageUrl?: string;
    spawns?: { locationId: string; note: string | null; location: { id: string; name: string } }[];
  };
}

export function DocumentForm({ seasonId, initialData }: DocumentFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData?.id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!initialData?.slug);

  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [spawns, setSpawns] = useState<SpawnEntry[]>(
    initialData?.spawns?.map(s => ({
      locationId: s.locationId,
      note: s.note || "",
    })) || []
  );

  useEffect(() => {
    fetch("/api/admin/locations")
      .then(res => res.json())
      .then((data: Location[]) => setAllLocations(data))
      .catch(() => setError("Не удалось загрузить список локаций"));
  }, []);

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
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка загрузки");
        return;
      }
      setImageUrl(data.url);
    } catch {
      setError("Ошибка сети");
    } finally {
      setUploading(false);
    }
  };

  const addSpawn = () => {
    const usedIds = new Set(spawns.map(s => s.locationId));
    const available = allLocations.find(loc => !usedIds.has(loc.id));
    if (available) {
      setSpawns([...spawns, { locationId: available.id, note: "" }]);
    }
  };

  const removeSpawn = (index: number) => {
    setSpawns(spawns.filter((_, i) => i !== index));
  };

  const updateSpawn = (index: number, field: keyof SpawnEntry, value: string) => {
    setSpawns(spawns.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const url = isEditing
        ? `/api/admin/documents/${initialData!.id}`
        : `/api/admin/documents`;
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seasonId,
          name,
          slug,
          description: description || undefined,
          imageUrl: imageUrl || undefined,
          spawns,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка сохранения");
        return;
      }
      router.push("/admin/documents");
      router.refresh();
    } catch {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  const usedLocationIds = new Set(spawns.map(s => s.locationId));
  const availableToAdd = allLocations.filter(loc => !usedLocationIds.has(loc.id));

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <Card>
        <div className="space-y-4">
          <Input
            label="Название документа *"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Например: Техническая документация"
            required
            disabled={loading}
          />
          <Input
            label="Slug (URL) *"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="technical-docs"
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
              placeholder="Описание типа документа"
              rows={3}
              className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors resize-none disabled:opacity-50"
              disabled={loading}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300">
              Изображение
            </label>
            {imageUrl ? (
              <div className="relative inline-block">
                <Image
                  src={imageUrl}
                  alt="Preview"
                  width={200}
                  height={200}
                  className="rounded-md border border-zinc-800"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 hover:bg-rose-600 rounded-full flex items-center justify-center transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-700 rounded-md p-8 text-center cursor-pointer hover:border-amber-500/50 transition-colors"
              >
                <Upload className="mx-auto mb-2 text-zinc-500" size={24} />
                <p className="text-sm text-zinc-400">
                  {uploading ? "Загрузка..." : "Нажмите для загрузки изображения"}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  JPEG, PNG, WebP, GIF (макс. 5MB)
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading || loading}
            />
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="text-amber-500" size={20} />
            <h3 className="text-lg font-bold">Локации спавна</h3>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={<Plus size={14} />}
            onClick={addSpawn}
            disabled={availableToAdd.length === 0 || loading}
          >
            Добавить локацию
          </Button>
        </div>

        {allLocations.length === 0 ? (
          <p className="text-zinc-500 text-sm py-4">
            Сначала создайте хотя бы одну локацию в разделе{" "}
            <Link href="/admin/locations" className="text-amber-500 hover:underline">
              Локации
            </Link>
            .
          </p>
        ) : spawns.length === 0 ? (
          <p className="text-zinc-500 text-sm py-4">
            Документ пока не спавнится ни на одной локации.
          </p>
        ) : (
          <div className="space-y-3">
            {spawns.map((spawn, index) => {
              const location = allLocations.find(l => l.id === spawn.locationId);
              return (
                <div
                  key={index}
                  className="flex gap-3 items-start bg-zinc-950 border border-zinc-800 rounded-md p-3"
                >
                  <select
                    value={spawn.locationId}
                    onChange={(e) => updateSpawn(index, "locationId", e.target.value)}
                    className="w-48 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-sm focus:outline-none focus:border-amber-500"
                    disabled={loading}
                  >
                    <option value={spawn.locationId}>
                      {location?.name || "Неизвестная локация"}
                    </option>
                    {availableToAdd.map(loc => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={spawn.note}
                    onChange={(e) => updateSpawn(index, "note", e.target.value)}
                    placeholder="Заметка (напр.: в сейфе, на столе)"
                    className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-sm focus:outline-none focus:border-amber-500"
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    icon={<Trash2 size={14} />}
                    onClick={() => removeSpawn(index)}
                    disabled={loading}
                    aria-label="Удалить локацию"
                  />
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {error && (
        <div className="text-rose-500 text-sm bg-rose-500/10 border border-rose-500/20 rounded px-3 py-2">
          {error}
        </div>
      )}
      <div className="flex gap-3">
        <Button type="submit" isLoading={loading} disabled={!name || !slug}>
          {isEditing ? "Сохранить" : "Создать документ"}
        </Button>
        <Link href="/admin/documents">
          <Button variant="secondary" type="button">Отмена</Button>
        </Link>
      </div>
    </form>
  );
}