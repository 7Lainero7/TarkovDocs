import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RewardForm } from "@/components/forms/RewardForm";

interface EditRewardPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRewardPage({ params }: EditRewardPageProps) {
  const { id } = await params;
  await requireAdmin();

  const reward = await prisma.reward.findUnique({
    where: { id },
    include: { page: true },
  });

  if (!reward) {
    notFound();
  }

  return (
    <div>
      <div className="mb-8">
        <Link
          href={`/admin/rewards/${reward.id}`}
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Назад к награде
        </Link>
        <h1 className="text-3xl font-bold">Редактирование награды</h1>
        <p className="text-zinc-400 mt-1">{reward.name}</p>
      </div>

      <RewardForm
        pageId={reward.pageId}
        initialData={{
          id: reward.id,
          order: reward.order,
          name: reward.name,
          slug: reward.slug,
          description: reward.description || undefined,
          imageUrl: reward.imageUrl || undefined,
          requiredDocumentsCount: reward.requiredDocumentsCount,
        }}
      />
    </div>
  );
}