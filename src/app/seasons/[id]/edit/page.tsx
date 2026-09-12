import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { SeasonForm } from "../../_components/SeasonForm";

interface EditSeasonPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSeasonPage({ params }: EditSeasonPageProps) {
  const { id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("admin-token")?.value;

  if (!token || token !== process.env.ADMIN_TOKEN) {
    redirect("/");
  }

  const season = await prisma.season.findUnique({
    where: { id },
  });

  if (!season) {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <Link
          href="/admin/seasons"
          className="text-sm text-zinc-400 hover:text-white transition-colors mb-4 inline-block"
        >
          Назад к списку сезонов
        </Link>
        <h1 className="text-3xl font-bold">Редактировать сезон</h1>
      </div>

      <SeasonForm
        initialData={{
          id: season.id,
          name: season.name,
          slug: season.slug,
          description: season.description || "",
          isActive: season.isActive,
        }}
      />
    </div>
  );
}