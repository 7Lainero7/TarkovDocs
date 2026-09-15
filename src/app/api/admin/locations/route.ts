import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdmin } from "@/lib/auth";
import { z } from "zod";

const locationSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
});

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const locations = await prisma.location.findMany({
    include: {
      _count: { select: { spawns: true } },
      spawns: {
        include: { document: { include: { season: true } } },
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(locations);
}

export async function POST(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = locationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Ошибка валидации" },
        { status: 400 }
      );
    }

    const existing = await prisma.location.findUnique({
      where: { slug: parsed.data.slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Локация с таким slug уже существует" },
        { status: 409 }
      );
    }

    const location = await prisma.location.create({ data: parsed.data });
    return NextResponse.json(location, { status: 201 });
  } catch (error) {
    console.error("Error creating location:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}