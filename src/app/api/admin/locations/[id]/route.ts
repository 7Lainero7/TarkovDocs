import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdmin } from "@/lib/auth";
import { z } from "zod";

const locationUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const location = await prisma.location.findUnique({
    where: { id },
    include: {
      spawns: {
        include: { document: { include: { season: true } } },
      },
    },
  });

  if (!location) {
    return NextResponse.json({ error: "Локация не найдена" }, { status: 404 });
  }

  return NextResponse.json(location);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = locationUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Ошибка валидации" },
        { status: 400 }
      );
    }

    const existing = await prisma.location.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Локация не найдена" }, { status: 404 });
    }

    if (parsed.data.slug && parsed.data.slug !== existing.slug) {
      const slugExists = await prisma.location.findUnique({
        where: { slug: parsed.data.slug },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: "Локация с таким slug уже существует" },
          { status: 409 }
        );
      }
    }

    const location = await prisma.location.update({ where: { id }, data: parsed.data });
    return NextResponse.json(location);
  } catch (error) {
    console.error("Error updating location:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = await params;
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  try {
    const existing = await prisma.location.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Локация не найдена" }, { status: 404 });
    }

    await prisma.location.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting location:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}