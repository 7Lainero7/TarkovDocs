import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageForm } from "@/components/forms/PageForm";

interface NewPageProps {
  searchParams: Promise<{ seasonId?: string }>;
}

export default async function NewPagePage({ searchParams }: NewPageProps) {
  await requireAdmin();
  const { seasonId } = await searchParams;
  
  if (!seasonId) {
    notFound();
  }
  
  const season = await prisma.season.findUnique({
    where: { id: seasonId },
    include: {
      pages: {
        orderBy: { number: "desc" },
        take: 1,
      },
    },
  });
  
  if (!season) {
    notFound();
  }
  
  const nextNumber = season.pages.length > 0 ? season.pages[0].number + 1 : 1;
  
  return (
    <div>
      <div className="mb-8">
        <Link
          href={`/admin/seasons/${season.id}`}
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Назад к сезону «{season.name}»
        </Link>
        <h1 className="text-3xl font-bold">Новая страница</h1>
        <p className="text-zinc-400 mt-1">Сезон: {season.name}</p>
      </div>
      
      <PageForm seasonId={season.id} defaultNumber={nextNumber} />
    </div>
  );
}