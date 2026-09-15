import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Edit } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DeleteButton } from "@/components/DeleteButton";

interface SeasonDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SeasonDetailPage({ params }: SeasonDetailPageProps) {
  const { id } = await params;
  await requireAdmin();

  const season = await prisma.season.findUnique({
    where: { id },
    include: {
      pages: {
        include: {
          _count: { select: { rewards: true } },
        },
        orderBy: { number: "asc" },
      },
    },
  });

  if (!season) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/seasons"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Назад к списку сезонов
        </Link>
      </div>

      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{season.name}</h1>
            {season.isActive && <Badge variant="success">Активен</Badge>}
          </div>
          {season.description && (
            <p className="text-zinc-400 mb-2">{season.description}</p>
          )}
          <p className="text-sm text-zinc-500 font-mono">slug: {season.slug}</p>
        </div>

        <div className="flex gap-2">
          <Link href={`/admin/seasons/${season.id}/edit`}>
            <Button variant="secondary" icon={<Edit size={16} />}>Редактировать</Button>
          </Link>
          <DeleteButton
            url={`/api/admin/seasons/${season.id}`}
            itemName={season.name}
            variant="text"
          />
        </div>
      </div>

      <Card padding="none">
        <div className="flex justify-between items-center p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold">Страницы сезона</h2>
          <Link href={`/admin/pages/new?seasonId=${season.id}`}>
            <Button icon={<Plus size={16} />}>Добавить страницу</Button>
          </Link>
        </div>

        {season.pages.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-zinc-400 mb-4">В этом сезоне пока нет страниц</p>
            <Link href={`/admin/pages/new?seasonId=${season.id}`}>
              <Button>Создать первую страницу</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {season.pages.map((page) => (
              <div key={page.id} className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-zinc-800 rounded flex items-center justify-center font-bold text-zinc-400">
                    {page.number}
                  </div>
                  <div>
                    <h3 className="font-medium">{page.title}</h3>
                    <p className="text-sm text-zinc-500">
                      Наград: {page._count.rewards}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/admin/pages/${page.id}`}>
                    <Button variant="secondary" size="sm">Награды</Button>
                  </Link>
                  <Link href={`/admin/pages/${page.id}/edit`}>
                    <Button variant="ghost" size="sm" icon={<Edit size={14} />} />
                  </Link>
                  <DeleteButton
                    url={`/api/admin/pages/${page.id}`}
                    itemName={page.title}
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