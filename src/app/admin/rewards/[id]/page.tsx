import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DeleteButton } from "@/components/DeleteButton";
import Image from "next/image";

interface RewardDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RewardDetailPage({ params }: RewardDetailPageProps) {
  const { id } = await params;
  await requireAdmin();

  const reward = await prisma.reward.findUnique({
    where: { id },
    include: {
      page: { include: { season: true } },
    },
  });

  if (!reward) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/admin/pages/${reward.pageId}`}
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Назад к странице «{reward.page.title}»
        </Link>
      </div>

      <div className="flex justify-between items-start mb-8">
        <div className="flex gap-6">
          {reward.imageUrl && (
            <Image
              src={reward.imageUrl}
              alt={reward.name}
              width={120}
              height={120}
              className="rounded-md border border-zinc-800"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold mb-2">{reward.name}</h1>
            <p className="text-zinc-400">
              Порядок: {reward.order} • Страница: {reward.page.title}
            </p>
            <p className="text-sm text-zinc-500 font-mono mt-1">slug: {reward.slug}</p>
            <p className="text-amber-500 mt-2 font-medium">
              📄 Документов для получения: {reward.requiredDocumentsCount}
            </p>
            {reward.description && (
              <p className="text-zinc-400 mt-2">{reward.description}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/admin/rewards/${reward.id}/edit`}>
            <Button variant="secondary" icon={<Edit size={16} />}>Редактировать</Button>
          </Link>
          <DeleteButton
            url={`/api/admin/rewards/${reward.id}`}
            itemName={reward.name}
            variant="text"
          />
        </div>
      </div>

      <Card>
        <h2 className="text-xl font-bold mb-4">Информация</h2>
        <p className="text-zinc-400">
          Для получения этой награды игроку необходимо выбрать{" "}
          <span className="text-amber-500 font-bold">{reward.requiredDocumentsCount}</span>{" "}
          документов. Игрок самостоятельно решает, какие именно документы ему нужны.
        </p>
      </Card>
    </div>
  );
}