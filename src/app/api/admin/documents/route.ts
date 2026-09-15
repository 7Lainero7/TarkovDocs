import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdmin } from "@/lib/auth";
import { z } from "zod";

const documentSchema = z.object({
  seasonId: z.string().min(1),
  name: z.string().min(1, "Название обязательно"),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug может содержать только латинские буквы, цифры и дефисы"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
});

export async function GET(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const seasonId = searchParams.get("seasonId");
  const documents = await prisma.document.findMany({
    where: seasonId ? { seasonId } : {},
    include: {
      season: true,
      _count: { select: { spawns: true } },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(documents);
}

export async function POST(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const parsed = documentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Ошибка валидации" },
        { status: 400 }
      );
    }
    const existing = await prisma.document.findUnique({
      where: {
        seasonId_slug: {
          seasonId: parsed.data.seasonId,
          slug: parsed.data.slug,
        },
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Документ с таким slug уже существует в этом сезоне" },
        { status: 409 }
      );
    }
    const document = await prisma.document.create({ data: parsed.data });
    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}