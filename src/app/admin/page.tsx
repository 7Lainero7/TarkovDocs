import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin-token")?.value;

  if (!token || token !== process.env.ADMIN_TOKEN) {
    redirect("/");
  }

  const [
    seasonCount,
    pageCount,
    rewardCount,
    documentCount,
    locationCount,
  ] = await Promise.all([
    prisma.season.count(),
    prisma.page.count(),
    prisma.reward.count(),
    prisma.document.count(),
    prisma.location.count(),
  ]);

  const stats = [
    { label: "Сезоны", value: seasonCount, href: "/admin/seasons" },
    { label: "Страницы", value: pageCount, href: "/admin/seasons" },
    { label: "Награды", value: rewardCount, href: "/admin/seasons" },
    { label: "Документы", value: documentCount, href: "/admin/documents" },
    { label: "Локации", value: locationCount, href: "/admin/locations" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Дашборд</h1>
        <p className="text-zinc-400">Обзор текущего состояния базы данных</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="block bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-amber-500/50 transition-all"
          >
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="text-zinc-400 text-sm">{stat.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Быстрые действия</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/seasons/new"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-medium rounded-md transition-colors"
          >
            Создать сезон
          </Link>
          <Link
            href="/admin/documents/new"
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors"
          >
            Создать документ
          </Link>
          <Link
            href="/admin/locations/new"
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors"
          >
            Создать локацию
          </Link>
        </div>
      </div>
    </div>
  );
}