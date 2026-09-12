import { redirect } from "next/navigation";
import { cookies } from "next/headers";

/**
 * Проверяет авторизацию администратора.
 * Если токен неверный — редиректит на главную.
 * Возвращает true, если авторизован.
 */
export async function requireAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin-token")?.value;

  if (!token || token !== process.env.ADMIN_TOKEN) {
    redirect("/");
  }

  return true;
}

/**
 * Проверяет авторизацию без редиректа (для API)
 */
export async function checkAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin-token")?.value;
  return token === process.env.ADMIN_TOKEN;
}