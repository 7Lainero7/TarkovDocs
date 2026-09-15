import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SeasonForm } from "@/components/forms/SeasonForm";

interface EditSeasonPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSeasonPage({ params }: EditSeasonPageProps) {
  const { id } = await params;
  await requireAdmin();
  
  const season = await prisma.season.findUnique({
    where: { id },
  });
  
  if (!season) {
    notFound();
  }
  
  return (
    <div>
      <div className="mb-8">
        <Link
          href={`/admin/seasons/${season.id}`}
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Назад к сезону
        </Link>
        <h1 className="text-3xl font-bold">Редактирование сезона</h1>
        <p className="text-zinc-400 mt-1">{season.name}</p>
      </div>
      
      <SeasonForm
        initialData={{
          id: season.id,
          name: season.name,
          slug: season.slug,
          description: season.description || undefined,
          isActive: season.isActive,
        }}
      />
    </div>
  );
}