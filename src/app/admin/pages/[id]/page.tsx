import Link from "next/link";
import { ArrowLeft, Plus, Edit } from "lucide-react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DeleteButton } from "@/components/DeleteButton";

interface PageDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PageDetailPage({ params }: PageDetailPageProps) {
  const { id } = await params;
  await requireAdmin();

  const page = await prisma.page.findUnique({
    where: { id },
    include: {
      season: true,
      rewards: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!page) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/admin/seasons/${page.seasonId}`}
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Назад к сезону «{page.season.name}»
        </Link>
      </div>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{page.title}</h1>
          <p className="text-zinc-400">
            Страница {page.number} • Сезон: {page.season.name}
          </p>
          <p className="text-sm text-zinc-500 font-mono mt-1">slug: {page.slug}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/pages/${page.id}/edit`}>
            <Button variant="secondary" icon={<Edit size={16} />}>Редактировать</Button>
          </Link>
          <DeleteButton
            url={`/api/admin/pages/${page.id}`}
            itemName={page.title}
            variant="text"
          />
        </div>
      </div>

      <Card padding="none">
        <div className="flex justify-between items-center p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold">Награды страницы</h2>
          <Link href={`/admin/rewards/new?pageId=${page.id}`}>
            <Button icon={<Plus size={16} />}>Добавить награду</Button>
          </Link>
        </div>

        {page.rewards.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-zinc-400 mb-4">На этой странице пока нет наград</p>
            <Link href={`/admin/rewards/new?pageId=${page.id}`}>
              <Button>Создать первую награду</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {page.rewards.map((reward) => (
              <div key={reward.id} className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-zinc-800 rounded flex items-center justify-center font-bold text-zinc-400">
                    {reward.order}
                  </div>
                  <div>
                    <h3 className="font-medium">{reward.name}</h3>
                    <p className="text-sm text-zinc-500">
                      Документов: {reward.requiredDocumentsCount}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/rewards/${reward.id}`}>
                    <Button variant="secondary" size="sm">Просмотр</Button>
                  </Link>
                  <Link href={`/admin/rewards/${reward.id}/edit`}>
                    <Button variant="ghost" size="sm" icon={<Edit size={14} />} />
                  </Link>
                  <DeleteButton
                    url={`/api/admin/rewards/${reward.id}`}
                    itemName={reward.name}
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}