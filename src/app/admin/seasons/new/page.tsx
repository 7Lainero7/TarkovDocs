import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { SeasonForm } from "@/components/forms/SeasonForm";

export default async function NewSeasonPage() {
  await requireAdmin();

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/seasons"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Назад к списку сезонов
        </Link>
        <h1 className="text-3xl font-bold">Новый сезон</h1>
      </div>

      <SeasonForm />
    </div>
  );
}