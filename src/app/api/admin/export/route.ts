import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdmin } from "@/lib/auth";

interface ExportedSeason {
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  pages: {
    number: number;
    title: string;
    slug: string;
    rewards: {
      order: number;
      name: string;
      slug: string;
      description: string | null;
      imageUrl: string | null;
      requiredDocumentsCount: number;
    }[];
  }[];
  documents: {
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    spawns: {
      locationSlug: string;
      note: string | null;
    }[];
  }[];
}

interface ExportData {
  version: string;
  exportedAt: string;
  seasons: ExportedSeason[];
  locations: {
    name: string;
    slug: string;
    description: string | null;
  }[];
}

export async function GET(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const seasonId = searchParams.get("seasonId");
    const where = seasonId ? { id: seasonId } : {};

    const seasons = await prisma.season.findMany({
      where,
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
          include: {
            spawns: {
              include: { location: true },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const locations = await prisma.location.findMany({
      orderBy: { name: "asc" },
    });

    const exportData: ExportData = {
      version: "2.0",
      exportedAt: new Date().toISOString(),
      seasons: seasons.map((season) => ({
        name: season.name,
        slug: season.slug,
        description: season.description,
        isActive: season.isActive,
        pages: season.pages.map((page) => ({
          number: page.number,
          title: page.title,
          slug: page.slug,
          rewards: page.rewards.map((reward) => ({
            order: reward.order,
            name: reward.name,
            slug: reward.slug,
            description: reward.description,
            imageUrl: reward.imageUrl,
            requiredDocumentsCount: reward.requiredDocumentsCount,
          })),
        })),
        documents: season.documents.map((doc) => ({
          name: doc.name,
          slug: doc.slug,
          description: doc.description,
          imageUrl: doc.imageUrl,
          spawns: doc.spawns.map((spawn) => ({
            locationSlug: spawn.location.slug,
            note: spawn.note,
          })),
        })),
      })),
      locations: locations.map((loc) => ({
        name: loc.name,
        slug: loc.slug,
        description: loc.description,
      })),
    };

    const json = JSON.stringify(exportData, null, 2);
    const date = new Date().toISOString().split("T")[0];
    const filename = `tarkovdocs-backup-${date}.json`;

    return new NextResponse(json, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting data:", error);
    return NextResponse.json({ error: "Ошибка экспорта" }, { status: 500 });
  }
}