import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { z } from "zod";

const seasonSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  slug: z.string().min(1, "Slug обязателен").regex(/^[a-z0-9-]+$/, "Slug может содержать только латинские буквы, цифры и дефисы"),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin-token")?.value;
  return token === process.env.ADMIN_TOKEN;
}

export async function GET() {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const seasons = await prisma.season.findMany({
    include: { pages: true, documents: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(seasons);
}

export async function POST(request: Request) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = seasonSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Ошибка валидации" },
        { status: 400 }
      );
    }

    // Проверяем уникальность slug
    const existing = await prisma.season.findUnique({
      where: { slug: parsed.data.slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Сезон с таким slug уже существует" },
        { status: 409 }
      );
    }

    const season = await prisma.season.create({
      data: parsed.data,
    });

    return NextResponse.json(season, { status: 201 });
  } catch (error) {
    console.error("Error creating season:", error);
    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}