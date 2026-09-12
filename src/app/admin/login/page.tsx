import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin-token")?.value;

  // Если уже авторизован, редиректим на дашборд
  if (token === process.env.ADMIN_TOKEN) {
    redirect("/admin");
  }

  // Если не авторизован, редиректим на главную (там есть форма входа)
  redirect("/");
}