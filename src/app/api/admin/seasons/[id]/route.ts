import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdmin } from "@/lib/auth";
import { z } from "zod";

const seasonUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const season = await prisma.season.findUnique({
    where: { id },
    include: { pages: true, documents: true, locations: true },
  });

  if (!season) {
    return NextResponse.json({ error: "Сезон не найден" }, { status: 404 });
  }

  return NextResponse.json(season);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = seasonUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Ошибка валидации" },
        { status: 400 }
      );
    }

    const existing = await prisma.season.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Сезон не найден" }, { status: 404 });
    }

    if (parsed.data.slug && parsed.data.slug !== existing.slug) {
      const slugExists = await prisma.season.findUnique({
        where: { slug: parsed.data.slug },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: "Сезон с таким slug уже существует" },
          { status: 409 }
        );
      }
    }

    const season = await prisma.season.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json(season);
  } catch (error) {
    console.error("Error updating season:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = await params;
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  try {
    const existing = await prisma.season.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Сезон не найден" }, { status: 404 });
    }

    await prisma.season.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting season:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}