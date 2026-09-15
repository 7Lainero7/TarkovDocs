import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DocumentForm } from "@/components/forms/DocumentForm";

interface EditDocumentPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditDocumentPage({ params }: EditDocumentPageProps) {
  const { id } = await params;
  await requireAdmin();
  const document = await prisma.document.findUnique({
    where: { id },
    include: { 
      season: true,
      spawns: { include: { location: true } },
    },
  });
  if (!document) {
    notFound();
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
        <h1 className="text-3xl font-bold">Редактирование документа</h1>
        <p className="text-zinc-400 mt-1">{document.name}</p>
      </div>
      <DocumentForm
        seasonId={document.seasonId}
        initialData={{
          id: document.id,
          name: document.name,
          slug: document.slug,
          description: document.description || undefined,
          imageUrl: document.imageUrl || undefined,
          spawns: document.spawns,
        }}
      />
    </div>
  );
}