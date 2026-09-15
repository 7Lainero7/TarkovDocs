import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SeasonView } from "@/components/SeasonView";

interface SeasonPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SeasonPage({ params }: SeasonPageProps) {
  const { slug } = await params;

  const season = await prisma.season.findUnique({
    where: { slug },
    include: {
      pages: {
        include: {
          rewards: {
            orderBy: { order: "asc" },
          },
        },
        orderBy: { number: "asc" },
      },
      documents: {
        orderBy: { name: "asc" },
      },
    },
  });

  if (!season) {
    notFound();
  }

  return <SeasonView season={season} />;
}