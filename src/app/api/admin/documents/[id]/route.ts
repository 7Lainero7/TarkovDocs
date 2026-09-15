import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdmin } from "@/lib/auth";
import { z } from "zod";

const documentUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }
  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      season: true,
      spawns: { include: { location: true } },
    },
  });
  if (!document) {
    return NextResponse.json({ error: "Документ не найден" }, { status: 404 });
  }
  return NextResponse.json(document);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const parsed = documentUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Ошибка валидации" },
        { status: 400 }
      );
    }
    const existing = await prisma.document.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Документ не найден" }, { status: 404 });
    }
    if (parsed.data.slug && parsed.data.slug !== existing.slug) {
      const slugExists = await prisma.document.findUnique({
        where: { seasonId_slug: { seasonId: existing.seasonId, slug: parsed.data.slug } },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: "Документ с таким slug уже существует" },
          { status: 409 }
        );
      }
    }
    const document = await prisma.document.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json(document);
  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = await params;
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }
  try {
    const existing = await prisma.document.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Документ не найден" }, { status: 404 });
    }
    await prisma.document.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}