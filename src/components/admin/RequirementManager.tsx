"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";

interface Requirement {
  id: string;
  documentId: string;
  amount: number;
  document: {
    id: string;
    name: string;
  };
}

interface Document {
  id: string;
  name: string;
}

interface RequirementManagerProps {
  rewardId: string;
  requirements: Requirement[];
  availableDocuments: Document[];
}

export function RequirementManager({
  rewardId,
  requirements,
  availableDocuments,
}: RequirementManagerProps) {
  const router = useRouter();
  const [selectedDocId, setSelectedDocId] = useState("");
  const [amount, setAmount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const handleAdd = async () => {
    if (!selectedDocId) {
      setError("Выберите документ");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch(`/api/admin/rewards/${rewardId}/requirements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: selectedDocId,
          amount,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Ошибка добавления");
        return;
      }
      
      setSelectedDocId("");
      setAmount(1);
      router.refresh();
    } catch {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemove = async (documentId: string) => {
    if (!confirm("Удалить это требование?")) return;
    
    try {
      const res = await fetch(
        `/api/admin/rewards/${rewardId}/requirements?documentId=${documentId}`,
        { method: "DELETE" }
      );
      
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Ошибка удаления");
        return;
      }
      
      router.refresh();
    } catch {
      alert("Ошибка сети");
    }
  };
  
  const documentOptions = availableDocuments.map((doc) => ({
    value: doc.id,
    label: doc.name,
  }));
  
  return (
    <div className="p-6">
      {requirements.length === 0 ? (
        <p className="text-zinc-400 text-center py-8">
          Требования ещё не добавлены
        </p>
      ) : (
        <div className="space-y-2 mb-6">
          {requirements.map((req) => (
            <div
              key={req.id}
              className="flex items-center justify-between bg-zinc-800/50 rounded-md px-4 py-3"
            >
              <div className="flex items-center gap-4">
                <span className="font-medium">{req.document.name}</span>
                <span className="text-zinc-400">×{req.amount}</span>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleRemove(req.documentId)}
                icon={<Trash2 size={14} />}
              />
            </div>
          ))}
        </div>
      )}
      
      <div className="border-t border-zinc-800 pt-6">
        <h3 className="text-sm font-medium mb-4">Добавить требование</h3>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Select
              label="Документ"
              options={documentOptions}
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              placeholder="Выберите документ"
            />
          </div>
          <div className="w-24">
            <Input
              label="Количество"
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value) || 1)}
            />
          </div>
          <Button
            onClick={handleAdd}
            isLoading={loading}
            disabled={!selectedDocId}
            icon={<Plus size={16} />}
          >
            Добавить
          </Button>
        </div>
        
        {error && (
          <div className="text-rose-500 text-sm bg-rose-500/10 border border-rose-500/20 rounded px-3 py-2 mt-3">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}