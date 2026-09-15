import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdmin } from "@/lib/auth";
import { z } from "zod";

const rewardUpdateSchema = z.object({
  order: z.number().int().min(1).optional(),
  name: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  requiredDocumentsCount: z.number().int().min(1).max(10).optional(), // 👈
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }
  const reward = await prisma.reward.findUnique({
    where: { id },
    include: { page: { include: { season: true } } },
  });
  if (!reward) {
    return NextResponse.json({ error: "Награда не найдена" }, { status: 404 });
  }
  return NextResponse.json(reward);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const parsed = rewardUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Ошибка валидации" },
        { status: 400 }
      );
    }
    const existing = await prisma.reward.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Награда не найдена" }, { status: 404 });
    }
    if (parsed.data.order && parsed.data.order !== existing.order) {
      const orderExists = await prisma.reward.findUnique({
        where: { pageId_order: { pageId: existing.pageId, order: parsed.data.order } },
      });
      if (orderExists) {
        return NextResponse.json(
          { error: `Награда с порядком ${parsed.data.order} уже существует` },
          { status: 409 }
        );
      }
    }
    const reward = await prisma.reward.update({ where: { id }, data: parsed.data });
    return NextResponse.json(reward);
  } catch (error) {
    console.error("Error updating reward:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = await params;
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }
  try {
    const existing = await prisma.reward.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Награда не найдена" }, { status: 404 });
    }
    await prisma.reward.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting reward:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}