import Link from "next/link";
import { Plus, Edit } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DeleteButton } from "@/components/DeleteButton";
import Image from "next/image";

export default async function AdminDocumentsPage() {
  await requireAdmin();

  const documents = await prisma.document.findMany({
    include: {
      season: true,
      _count: {
        select: {
          spawns: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <AdminHeader
        title="Документы"
        description="Управление типами документов"
        actions={
          <Link href="/admin/documents/new">
            <Button icon={<Plus size={16} />}>Создать документ</Button>
          </Link>
        }
      />

      {documents.length === 0 ? (
        <Card className="text-center" padding="lg">
          <p className="text-zinc-400 mb-4">Пока нет ни одного документа</p>
          <Link href="/admin/documents/new">
            <Button>Создать первый документ</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <Card key={doc.id}>
              <div className="flex gap-4">
                {doc.imageUrl ? (
                  <Image
                    src={doc.imageUrl}
                    alt={doc.name}
                    width={80}
                    height={80}
                    className="rounded-md border border-zinc-800 object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 bg-zinc-800 rounded-md flex items-center justify-center text-zinc-500 text-xs">
                    Нет фото
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold mb-1 truncate">{doc.name}</h3>
                  <p className="text-sm text-zinc-500 mb-2 truncate">
                    {doc.season.name}
                  </p>
                  <div className="text-xs text-zinc-500">
                    <span>{doc._count.spawns} локаций</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-zinc-800">
                <Link href={`/admin/documents/${doc.id}/edit`} className="flex-1">
                  <Button variant="secondary" size="sm" icon={<Edit size={14} />} className="w-full">
                    Изменить
                  </Button>
                </Link>
                <DeleteButton
                  url={`/api/admin/documents/${doc.id}`}
                  itemName={doc.name}
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