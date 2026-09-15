"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface DeleteButtonProps {
  url: string;
  itemName: string;
  onDeleted?: () => void;
  size?: "sm" | "md";
  variant?: "icon" | "text";
}

export function DeleteButton({ url, itemName, onDeleted, size = "sm", variant = "icon" }: DeleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Удалить "${itemName}"? Это действие необратимо.`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(url, { method: "DELETE" });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Ошибка удаления");
        return;
      }

      onDeleted?.();
      router.refresh();
    } catch {
      alert("Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  if (variant === "icon") {
    return (
      <Button
        variant="danger"
        size={size}
        onClick={handleDelete}
        isLoading={loading}
        icon={<Trash2 size={size === "sm" ? 14 : 16} />}
        aria-label="Удалить"
      />
    );
  }

  return (
    <Button
      variant="danger"
      size={size}
      onClick={handleDelete}
      isLoading={loading}
    >
      Удалить
    </Button>
  );
}