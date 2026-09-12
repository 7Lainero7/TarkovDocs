import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Разрешаем доступ к странице логина
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Проверяем только /admin/* маршруты
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("admin-token")?.value;
    const adminToken = process.env.ADMIN_TOKEN;

    if (!token || token !== adminToken) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};