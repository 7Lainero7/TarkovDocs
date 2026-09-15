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
            orderBy: { order: "asc" },
          },
        },
        orderBy: { number: "asc" },
      },
      documents: true,
    },
  });
}

export async function getAllLocations() {
  return prisma.location.findMany({
    include: {
      spawns: {
        include: {
          document: { include: { season: true } },
        },
      },
    },
    orderBy: { name: "asc" },
  });
}