import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdmin } from "@/lib/auth";
import { z } from "zod";

const rewardSchema = z.object({
  pageId: z.string().min(1),
  order: z.number().int().min(1),
  name: z.string().min(1, "Название обязательно"),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  requiredDocumentsCount: z.number().int().min(1).max(10).optional(), // 👈
});

export async function GET(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const pageId = searchParams.get("pageId");
  const rewards = await prisma.reward.findMany({
    where: pageId ? { pageId } : {},
    include: { page: true },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(rewards);
}

export async function POST(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const parsed = rewardSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Ошибка валидации" },
        { status: 400 }
      );
    }
    const existing = await prisma.reward.findUnique({
      where: { pageId_order: { pageId: parsed.data.pageId, order: parsed.data.order } },
    });
    if (existing) {
      return NextResponse.json(
        { error: `Награда с порядком ${parsed.data.order} уже существует` },
        { status: 409 }
      );
    }
    const reward = await prisma.reward.create({ data: parsed.data });
    return NextResponse.json(reward, { status: 201 });
  } catch (error) {
    console.error("Error creating reward:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}