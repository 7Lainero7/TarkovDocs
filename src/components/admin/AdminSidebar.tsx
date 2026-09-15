"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  MapPin,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/admin", label: "Дашборд", icon: LayoutDashboard },
  { href: "/admin/seasons", label: "Сезоны", icon: Calendar },
  { href: "/admin/documents", label: "Документы", icon: FileText },
  { href: "/admin/locations", label: "Локации", icon: MapPin },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch {
      setLoading(false);
    }
  };

  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 p-4 flex flex-col shrink-0">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center">
          <span className="text-zinc-900 font-bold text-lg">T</span>
        </div>
        <span className="text-xl font-bold">TarkovDocs</span>
      </Link>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                isActive
                  ? "bg-amber-500/10 text-amber-500"
                  : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
              )}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-zinc-800">
        <button
          onClick={handleLogout}
          disabled={loading}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white disabled:opacity-50"
        >
          <LogOut size={18} />
          <span>{loading ? "Выходим..." : "Выйти"}</span>
        </button>
      </div>
    </aside>
  );
}