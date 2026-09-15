import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LocationForm } from "@/components/forms/LocationForm";

interface EditLocationPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditLocationPage({ params }: EditLocationPageProps) {
  const { id } = await params;
  await requireAdmin();

  const location = await prisma.location.findUnique({
    where: { id },
  });

  if (!location) {
    notFound();
  }

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/locations"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Назад к списку локаций
        </Link>
        <h1 className="text-3xl font-bold">Редактирование локации</h1>
        <p className="text-zinc-400 mt-1">{location.name}</p>
      </div>

      <LocationForm
        initialData={{
          id: location.id,
          name: location.name,
          slug: location.slug,
          description: location.description || undefined,
        }}
      />
    </div>
  );
}