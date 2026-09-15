import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdmin } from "@/lib/auth";
import { z } from "zod";

const rewardSchema = z.object({
  order: z.number().int().min(1),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  requiredDocumentsCount: z.number().int().min(1).optional(),
});

const pageSchema = z.object({
  number: z.number().int().min(1),
  title: z.string(),
  slug: z.string(),
  rewards: z.array(rewardSchema),
});

const spawnSchema = z.object({
  locationSlug: z.string(),
  note: z.string().nullable().optional(),
});

const documentSchema = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  spawns: z.array(spawnSchema),
});

const locationSchema = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
});

const seasonSchema = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  isActive: z.boolean(),
  pages: z.array(pageSchema),
  documents: z.array(documentSchema),
});

const importSchema = z.object({
  version: z.string(),
  exportedAt: z.string(),
  seasons: z.array(seasonSchema),
  locations: z.array(locationSchema).optional(),
});

export async function POST(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const mode = formData.get("mode") as string;

    if (!file) {
      return NextResponse.json({ error: "Файл не найден" }, { status: 400 });
    }

    const text = await file.text();
    let data: unknown;

    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "Неверный формат JSON" }, { status: 400 });
    }

    const parsed = importSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Неверная структура данных", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const result = {
      created: 0,
      updated: 0,
      errors: [] as string[],
    };

    // Создаём/обновляем глобальные локации
    const locationMap = new Map<string, string>();
    const importedLocations = parsed.data.locations || [];

    for (const loc of importedLocations) {
      try {
        const existing = await prisma.location.findUnique({ where: { slug: loc.slug } });
        if (existing) {
          await prisma.location.update({
            where: { id: existing.id },
            data: { name: loc.name, description: loc.description },
          });
          locationMap.set(loc.slug, existing.id);
        } else {
          const created = await prisma.location.create({
            data: { name: loc.name, slug: loc.slug, description: loc.description },
          });
          locationMap.set(loc.slug, created.id);
        }
      } catch {
        result.errors.push(`Ошибка импорта локации "${loc.slug}"`);
      }
    }

    for (const seasonData of parsed.data.seasons) {
      try {
        const existingSeason = await prisma.season.findUnique({
          where: { slug: seasonData.slug },
        });

        if (existingSeason && mode === "replace") {
          await prisma.season.delete({ where: { id: existingSeason.id } });
          result.updated++;
        } else if (existingSeason && mode === "merge") {
          result.errors.push(`Сезон "${seasonData.slug}" уже существует, пропущен`);
          continue;
        } else {
          result.created++;
        }

        const season = await prisma.season.create({
          data: {
            name: seasonData.name,
            slug: seasonData.slug,
            description: seasonData.description,
            isActive: seasonData.isActive,
          },
        });

        // Создаём документы
        const documentMap = new Map<string, string>();
        for (const doc of seasonData.documents) {
          const created = await prisma.document.create({
            data: {
              seasonId: season.id,
              name: doc.name,
              slug: doc.slug,
              description: doc.description,
              imageUrl: doc.imageUrl,
            },
          });
          documentMap.set(doc.slug, created.id);

          for (const spawn of doc.spawns) {
            const locationId = locationMap.get(spawn.locationSlug);
            if (locationId) {
              await prisma.documentSpawn.create({
                data: {
                  documentId: created.id,
                  locationId,
                  note: spawn.note,
                },
              });
            }
          }
        }

        // Создаём страницы и награды
        for (const page of seasonData.pages) {
          const createdPage = await prisma.page.create({
            data: {
              seasonId: season.id,
              number: page.number,
              title: page.title,
              slug: page.slug,
            },
          });

          for (const reward of page.rewards) {
            await prisma.reward.create({
              data: {
                pageId: createdPage.id,
                order: reward.order,
                name: reward.name,
                slug: reward.slug,
                description: reward.description,
                imageUrl: reward.imageUrl,
                requiredDocumentsCount: reward.requiredDocumentsCount || 3,
              },
            });
          }
        }
      } catch (error) {
        console.error(`Error importing season ${seasonData.slug}:`, error);
        result.errors.push(`Ошибка импорта сезона "${seasonData.slug}"`);
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error importing data:", error);
    return NextResponse.json({ error: "Ошибка импорта" }, { status: 500 });
  }
}