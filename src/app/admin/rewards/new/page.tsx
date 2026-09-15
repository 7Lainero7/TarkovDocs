import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RewardForm } from "@/components/forms/RewardForm";

interface NewRewardProps {
  searchParams: Promise<{ pageId?: string }>;
}

export default async function NewRewardPage({ searchParams }: NewRewardProps) {
  await requireAdmin();
  const { pageId } = await searchParams;
  
  if (!pageId) {
    notFound();
  }
  
  const page = await prisma.page.findUnique({
    where: { id: pageId },
    include: {
      season: true,
      rewards: {
        orderBy: { order: "desc" },
        take: 1,
      },
    },
  });
  
  if (!page) {
    notFound();
  }
  
  const nextOrder = page.rewards.length > 0 ? page.rewards[0].order + 1 : 1;
  
  return (
    <div>
      <div className="mb-8">
        <Link
          href={`/admin/pages/${page.id}`}
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Назад к странице «{page.title}»
        </Link>
        <h1 className="text-3xl font-bold">Новая награда</h1>
        <p className="text-zinc-400 mt-1">
          Страница: {page.title} • Сезон: {page.season.name}
        </p>
      </div>
      
      <RewardForm pageId={page.id} defaultOrder={nextOrder} />
    </div>
  );
}