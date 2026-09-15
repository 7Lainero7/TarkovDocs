"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export function ImportButton() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<"replace" | "merge">("replace");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowModal(true);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("mode", mode);

      const res = await fetch("/api/admin/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Ошибка импорта");
        return;
      }

      let message = `Импорт завершён!\n`;
      message += `Создано: ${data.created}\n`;
      message += `Обновлено: ${data.updated}\n`;
      if (data.errors.length > 0) {
        message += `\nОшибки:\n${data.errors.join("\n")}`;
      }
      alert(message);

      setShowModal(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      router.refresh();
    } catch {
      alert("Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => fileInputRef.current?.click()}
        isLoading={loading}
        icon={<Upload size={16} />}
      >
        Импорт данных
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedFile(null);
        }}
        title="Импорт данных"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">
            Файл: <span className="text-zinc-200">{selectedFile?.name}</span>
          </p>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Режим импорта:</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  value="replace"
                  checked={mode === "replace"}
                  onChange={() => setMode("replace")}
                  className="accent-amber-500"
                />
                <span className="text-sm">
                  <strong>Заменить</strong> — удалить существующие сезоны с такими же slug и создать заново
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  value="merge"
                  checked={mode === "merge"}
                  onChange={() => setMode("merge")}
                  className="accent-amber-500"
                />
                <span className="text-sm">
                  <strong>Объединить</strong> — пропустить существующие, добавить только новые
                </span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleImport}
              isLoading={loading}
              className="flex-1"
            >
              Импортировать
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setShowModal(false);
                setSelectedFile(null);
              }}
              className="flex-1"
            >
              Отмена
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}