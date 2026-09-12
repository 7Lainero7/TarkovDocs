import Link from "next/link";
import { LogoutButton } from "./_components/LogoutButton";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const menuItems = [
    { href: "/admin", label: "Дашборд" },
    { href: "/admin/seasons", label: "Сезоны" },
    { href: "/admin/documents", label: "Документы" },
    { href: "/admin/locations", label: "Локации" },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Сайдбар */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 p-4 flex flex-col shrink-0">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center">
            <span className="text-zinc-900 font-bold text-lg">T</span>
          </div>
          <span className="text-xl font-bold">TarkovDocs</span>
        </Link>

        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-zinc-800 transition-colors text-zinc-300 hover:text-white"
            >
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="pt-4 border-t border-zinc-800">
          <LogoutButton />
        </div>
      </aside>

      {/* Основной контент */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}