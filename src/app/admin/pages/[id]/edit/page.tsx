import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageForm } from "@/components/forms/PageForm";

interface EditPagePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPagePage({ params }: EditPagePageProps) {
  const { id } = await params;
  await requireAdmin();
  
  const page = await prisma.page.findUnique({
    where: { id },
    include: { season: true },
  });
  
  if (!page) {
    notFound();
  }
  
  return (
    <div>
      <div className="mb-8">
        <Link
          href={`/admin/pages/${page.id}`}
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Назад к странице
        </Link>
        <h1 className="text-3xl font-bold">Редактирование страницы</h1>
        <p className="text-zinc-400 mt-1">{page.title}</p>
      </div>
      
      <PageForm
        seasonId={page.seasonId}
        initialData={{
          id: page.id,
          number: page.number,
          title: page.title,
          slug: page.slug,
        }}
      />
    </div>
  );
}