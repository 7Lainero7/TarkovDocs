import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Edit } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DeleteButton } from "@/components/DeleteButton";

export default async function AdminSeasonsPage() {
  await requireAdmin();

  const seasons = await prisma.season.findMany({
    include: {
      pages: true,
      documents: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Сезоны</h1>
          <p className="text-zinc-400">Управление сезонными пропусками</p>
        </div>
        <Link href="/admin/seasons/new">
          <Button icon={<Plus size={16} />}>Создать сезон</Button>
        </Link>
      </div>

      {seasons.length === 0 ? (
        <Card className="text-center" padding="lg">
          <p className="text-zinc-400 mb-4">Пока нет ни одного сезона</p>
          <Link href="/admin/seasons/new">
            <Button>Создать первый сезон</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {seasons.map((season) => (
            <Card key={season.id}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold">{season.name}</h2>
                    {season.isActive && <Badge variant="success">Активен</Badge>}
                  </div>
                  {season.description && (
                    <p className="text-zinc-400 text-sm mb-3">{season.description}</p>
                  )}
                  <div className="flex gap-6 text-sm text-zinc-500">
                    <span>Страниц: {season.pages.length}</span>
                    <span>Документов: {season.documents.length}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/admin/seasons/${season.id}`}>
                    <Button variant="secondary" size="sm">Страницы</Button>
                  </Link>
                  <Link href={`/admin/seasons/${season.id}/edit`}>
                    <Button variant="ghost" size="sm" icon={<Edit size={14} />} />
                  </Link>
                  <DeleteButton
                    url={`/api/admin/seasons/${season.id}`}
                    itemName={season.name}
                    size="sm"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}