import Link from "next/link";
import { Plus, Edit, MapPin } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DeleteButton } from "@/components/DeleteButton";

export default async function AdminLocationsPage() {
  await requireAdmin();

  const locations = await prisma.location.findMany({
    include: {
      _count: {
        select: { spawns: true },
      },
      spawns: {
        include: {
          document: { include: { season: true } },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <AdminHeader
        title="Локации"
        description="Управление локациями для поиска документов"
        actions={
          <Link href="/admin/locations/new">
            <Button icon={<Plus size={16} />}>Создать локацию</Button>
          </Link>
        }
      />

      {locations.length === 0 ? (
        <Card className="text-center" padding="lg">
          <p className="text-zinc-400 mb-4">Пока нет ни одной локации</p>
          <Link href="/admin/locations/new">
            <Button>Создать первую локацию</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {locations.map((location) => (
            <Card key={location.id}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center shrink-0">
                  <MapPin className="text-amber-500" size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold mb-1 truncate">{location.name}</h3>
                  <p className="text-xs text-zinc-500 mb-2">
                    Документов: {location._count.spawns}
                  </p>
                  {location.spawns.length > 0 && (
                    <div className="text-xs text-zinc-400 space-y-1">
                      {location.spawns.slice(0, 3).map((spawn) => (
                        <div key={spawn.id} className="truncate">
                          • {spawn.document.name} ({spawn.document.season.name})
                        </div>
                      ))}
                      {location.spawns.length > 3 && (
                        <div className="text-zinc-500">
                          ...и ещё {location.spawns.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-zinc-800">
                <Link href={`/admin/locations/${location.id}/edit`} className="flex-1">
                  <Button variant="secondary" size="sm" icon={<Edit size={14} />} className="w-full">
                    Изменить
                  </Button>
                </Link>
                <DeleteButton
                  url={`/api/admin/locations/${location.id}`}
                  itemName={location.name}
                  size="sm"
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}