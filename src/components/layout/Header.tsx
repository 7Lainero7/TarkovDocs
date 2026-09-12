"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function Header() {
  const router = useRouter();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ошибка входа");
        return;
      }

      setShowAdminLogin(false);
      setToken("");
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
              <button
                onClick={() => setShowAdminLogin(!showAdminLogin)}
                className="hover:text-amber-500 transition-colors text-sm text-zinc-400"
              >
                Админ
              </button>
            </nav>
          </div>
        </div>
      </header>

      {showAdminLogin && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Вход в админку</h2>
              <button
                onClick={() => setShowAdminLogin(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label htmlFor="token" className="block text-sm font-medium mb-2">
                  Токен администратора
                </label>
                <input
                  id="token"
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Введите токен из .env"
                  className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-md focus:outline-none focus:border-amber-500 transition-colors"
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>

              {error && (
                <div className="text-rose-500 text-sm bg-rose-500/10 border border-rose-500/20 rounded px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-950 font-medium py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Входим..." : "Войти"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}