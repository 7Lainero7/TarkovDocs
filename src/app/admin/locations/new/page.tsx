import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { LocationForm } from "@/components/forms/LocationForm";

export default async function NewLocationPage() {
  await requireAdmin();

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
        <h1 className="text-3xl font-bold">Новая локация</h1>
      </div>

      <LocationForm />
    </div>
  );
}