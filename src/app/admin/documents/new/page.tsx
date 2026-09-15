import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DocumentForm } from "@/components/forms/DocumentForm";

interface NewDocumentProps {
  searchParams: Promise<{ seasonId?: string }>;
}

export default async function NewDocumentPage({ searchParams }: NewDocumentProps) {
  await requireAdmin();
  const { seasonId } = await searchParams;
  
  const seasons = await prisma.season.findMany({
    orderBy: { createdAt: "desc" },
  });
  
  // Если seasonId указан и валиден — используем его
  const activeSeason = seasonId
    ? seasons.find(s => s.id === seasonId)
    : seasons.find(s => s.isActive) || seasons[0];
  
  if (!activeSeason) {
    return (
      <div>
        <div className="mb-8">
          <Link
            href="/admin/documents"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={16} />
            Назад к списку документов
          </Link>
          <h1 className="text-3xl font-bold">Новый документ</h1>
        </div>
        <p className="text-zinc-400">Сначала создайте сезон.</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/documents"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Назад к списку документов
        </Link>
        <h1 className="text-3xl font-bold">Новый документ</h1>
        <p className="text-zinc-400 mt-1">Сезон: {activeSeason.name}</p>
      </div>
      
      <DocumentForm seasonId={activeSeason.id} />
    </div>
  );
}