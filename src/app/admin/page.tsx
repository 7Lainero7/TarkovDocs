import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Calendar, FileText, MapPin, Trophy, LayoutGrid } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/Button";
import { ExportButton } from "@/components/admin/ExportButton";
import { ImportButton } from "@/components/admin/ImportButton";

export default async function AdminDashboardPage() {
  await requireAdmin();

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
    { label: "Сезоны", value: seasonCount, href: "/admin/seasons", icon: Calendar },
    { label: "Страницы", value: pageCount, href: "/admin/seasons", icon: LayoutGrid },
    { label: "Награды", value: rewardCount, href: "/admin/seasons", icon: Trophy },
    { label: "Документы", value: documentCount, href: "/admin/documents", icon: FileText },
    { label: "Локации", value: locationCount, href: "/admin/locations", icon: MapPin },
  ];

  return (
    <div>
      <AdminHeader
        title="Дашборд"
        description="Обзор текущего состояния базы данных"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="hover:border-amber-500/50 transition-all">
                <Icon className="text-amber-500 mb-3" size={24} />
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-zinc-400 text-sm">{stat.label}</div>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card className="mt-8">
        <h2 className="text-xl font-bold mb-4">Быстрые действия</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/seasons/new">
            <Button>Создать сезон</Button>
          </Link>
          <Link href="/admin/documents/new">
            <Button variant="secondary">Создать документ</Button>
          </Link>
          <Link href="/admin/locations/new">
            <Button variant="secondary">Создать локацию</Button>
          </Link>
        </div>
      </Card>

      <Card className="mt-4">
        <h2 className="text-xl font-bold mb-4">Бэкап данных</h2>
        <div className="flex flex-wrap gap-3">
          <ExportButton />
          <ImportButton />
        </div>
        <p className="text-sm text-zinc-500 mt-3">
          Экспортируйте все данные в JSON для бэкапа или переноса на другой сервер.
          Импортируйте данные из ранее сохранённого файла.
        </p>
      </Card>
    </div>
  );
}