import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { SeasonDeleteButton } from "./_components/SeasonDeleteButton";

export default async function AdminSeasonsPage() {
  await requireAdmin(); // ← одна строка вместо трёх

  const seasons = await prisma.season.findMany({
    include: {
      pages: true,
      documents: true,
      locations: true,
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
        <Link
          href="/admin/seasons/new"
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-medium rounded-md transition-colors"
        >
          Создать сезон
        </Link>
      </div>

      {seasons.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
          <p className="text-zinc-400 mb-4">Пока нет ни одного сезона</p>
          <Link
            href="/admin/seasons/new"
            className="inline-block px-4 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-medium rounded-md transition-colors"
          >
            Создать первый сезон
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {seasons.map((season) => (
            <div
              key={season.id}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold">{season.name}</h2>
                    {season.isActive && (
                      <span className="px-2 py-0.5 text-xs bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded">
                        Активен
                      </span>
                    )}
                  </div>
                  {season.description && (
                    <p className="text-zinc-400 text-sm mb-3">{season.description}</p>
                  )}
                  <div className="flex gap-6 text-sm text-zinc-500">
                    <span>Страниц: {season.pages.length}</span>
                    <span>Документов: {season.documents.length}</span>
                    <span>Локаций: {season.locations.length}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/admin/seasons/${season.id}/edit`}
                    className="px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors"
                  >
                    Редактировать
                  </Link>
                  <SeasonDeleteButton seasonId={season.id} seasonName={season.name} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}