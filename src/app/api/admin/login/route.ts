import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import {
  checkRateLimit,
  recordFailure,
  recordSuccess,
  safeCompare,
  getClientIp,
  delay,
} from "@/lib/rate-limit";

const loginSchema = z.object({
  token: z.string().min(1),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const key = `login:${ip}`;

  const rateLimit = checkRateLimit(key);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Слишком много попыток входа. Попробуйте позже." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Неверный формат данных" }, { status: 400 });
    }

    const adminToken = process.env.ADMIN_TOKEN;
    if (!adminToken) {
      // Не раскрываем, что токен не настроен — единая ошибка
      return NextResponse.json({ error: "Неверный токен" }, { status: 401 });
    }

    const isValid = safeCompare(parsed.data.token, adminToken);
    if (!isValid) {
      recordFailure(key);
      // Замедляем перебор: каждая неудача ждёт 500 мс
      await delay(500);
      return NextResponse.json({ error: "Неверный токен" }, { status: 401 });
    }

    recordSuccess(key);

    const cookieStore = await cookies();
    cookieStore.set("admin-token", parsed.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}