import Link from "next/link";
import { getActiveSeason } from "@/lib/queries";

export default async function HomePage() {
  const season = await getActiveSeason();

  if (!season) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">Добро пожаловать в TarkovDocs</h1>
        <p className="text-zinc-400 mb-8">
          Сейчас нет активного сезона. Зайдите позже.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{season.name}</h1>
        {season.description && (
          <p className="text-zinc-400">{season.description}</p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link
          href={`/season/${season.slug}`}
          className="block p-6 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-amber-500/50 transition-all"
        >
          <h2 className="text-xl font-bold mb-2">Страницы сезона</h2>
          <p className="text-zinc-400 text-sm">
            {season.pages.length} страниц с наградами
          </p>
        </Link>

        <Link
          href="/documents"
          className="block p-6 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-amber-500/50 transition-all"
        >
          <h2 className="text-xl font-bold mb-2">Мои документы</h2>
          <p className="text-zinc-400 text-sm">
            Учёт и планирование фарма
          </p>
        </Link>

        <Link
          href="/locations"
          className="block p-6 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-amber-500/50 transition-all"
        >
          <h2 className="text-xl font-bold mb-2">Локации</h2>
          <p className="text-zinc-400 text-sm">
            Где искать документы
          </p>
        </Link>
      </div>

      {/* Место для рекламы */}
      <div className="mt-12 p-8 bg-zinc-900 border border-zinc-800 rounded-lg text-center text-zinc-500">
        <p>Рекламный блок</p>
      </div>
    </div>
  );
}