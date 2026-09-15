import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdmin } from "@/lib/auth";
import { z } from "zod";

const pageUpdateSchema = z.object({
  number: z.number().int().min(1).optional(),
  title: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = pageUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Ошибка валидации" },
        { status: 400 }
      );
    }

    const existing = await prisma.page.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Страница не найдена" }, { status: 404 });
    }

    if (parsed.data.number && parsed.data.number !== existing.number) {
      const numberExists = await prisma.page.findUnique({
        where: {
          seasonId_number: {
            seasonId: existing.seasonId,
            number: parsed.data.number,
          },
        },
      });

      if (numberExists) {
        return NextResponse.json(
          { error: `Страница с номером ${parsed.data.number} уже существует` },
          { status: 409 }
        );
      }
    }

    const page = await prisma.page.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error updating page:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = await params;
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  try {
    const existing = await prisma.page.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Страница не найдена" }, { status: 404 });
    }

    await prisma.page.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting page:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}