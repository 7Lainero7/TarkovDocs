"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface SeasonDeleteButtonProps {
  seasonId: string;
  seasonName: string;
}

export function SeasonDeleteButton({ seasonId, seasonName }: SeasonDeleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Удалить сезон "${seasonName}"? Это действие необратимо.`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/seasons/${seasonId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Ошибка удаления");
        return;
      }

      router.refresh();
    } catch {
      alert("Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="px-3 py-1.5 text-sm bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-md transition-colors disabled:opacity-50"
    >
      {loading ? "Удаление..." : "Удалить"}
    </button>
  );
}