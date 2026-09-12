import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { SeasonForm } from "../_components/SeasonForm";

export default async function NewSeasonPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin-token")?.value;

  if (!token || token !== process.env.ADMIN_TOKEN) {
    redirect("/");
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
        <h1 className="text-3xl font-bold">Новый сезон</h1>
      </div>

      <SeasonForm />
    </div>
  );
}