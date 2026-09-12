import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center">
              <span className="text-zinc-900 font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-bold">TarkovDocs</span>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link href="/" className="hover:text-amber-500 transition-colors">
              Главная
            </Link>
            <Link href="/documents" className="hover:text-amber-500 transition-colors">
              Документы
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}