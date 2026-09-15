import { getActiveSeason } from "@/lib/queries";
import { SeasonView } from "@/components/SeasonView";

export default async function HomePage() {
  const season = await getActiveSeason();

  if (!season) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">Сейчас нет активного сезона</h1>
        <p className="text-zinc-400">Зайдите позже.</p>
      </div>
    );
  }

  return <SeasonView season={season} />;
}