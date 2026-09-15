import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdmin } from "@/lib/auth";
import { z } from "zod";

const pageSchema = z.object({
  seasonId: z.string().min(1),
  number: z.number().int().min(1),
  title: z.string().min(1, "Название обязательно"),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug может содержать только латинские буквы, цифры и дефисы"),
});

export async function POST(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = pageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Ошибка валидации" },
        { status: 400 }
      );
    }

    const season = await prisma.season.findUnique({
      where: { id: parsed.data.seasonId },
    });

    if (!season) {
      return NextResponse.json({ error: "Сезон не найден" }, { status: 404 });
    }

    const existingPage = await prisma.page.findUnique({
      where: {
        seasonId_number: {
          seasonId: parsed.data.seasonId,
          number: parsed.data.number,
        },
      },
    });

    if (existingPage) {
      return NextResponse.json(
        { error: `Страница с номером ${parsed.data.number} уже существует в этом сезоне` },
        { status: 409 }
      );
    }

    const page = await prisma.page.create({
      data: parsed.data,
    });

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error("Error creating page:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}