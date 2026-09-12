import { prisma } from "./prisma";

export async function getActiveSeason() {
  return prisma.season.findFirst({
    where: { isActive: true },
    include: {
      pages: {
        include: {
          rewards: true,
        },
        orderBy: { number: "asc" },
      },
      documents: true,
      locations: true,
    },
  });
}

export async function getSeasonBySlug(slug: string) {
  return prisma.season.findUnique({
    where: { slug },
    include: {
      pages: {
        include: {
          rewards: {
            include: {
              requirements: {
                include: {
                  document: true,
                },
              },
            },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { number: "asc" },
      },
      documents: true,
      locations: {
        include: {
          spawns: {
            include: {
              document: true,
            },
          },
        },
      },
    },
  });
}