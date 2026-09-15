import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { MessageCircle, Send, Mail } from "lucide-react";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "TarkovDocs — Сезонный пропуск Escape from Tarkov",
  description: "Отслеживай документы и награды сезонного пропуска в Escape from Tarkov",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const discordUrl = process.env.NEXT_PUBLIC_DISCORD_URL;
  const telegramUrl = process.env.NEXT_PUBLIC_TELEGRAM_URL;
  const feedbackEmail = process.env.NEXT_PUBLIC_FEEDBACK_EMAIL;

  return (
    <html lang="ru" className="dark">
      <body className={`${inter.variable} font-sans`}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="border-t border-zinc-800 py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-zinc-500">
                © 2026 TarkovDocs. Не является официальным продуктом Battlestate Games.
              </p>

              <div className="flex items-center gap-4">
                {discordUrl && (
                  <a
                    href={discordUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-zinc-400 hover:text-amber-500 transition-colors flex items-center gap-1"
                  >
                    <MessageCircle size={16} />
                    Discord
                  </a>
                )}
                {telegramUrl && (
                  <a
                    href={telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-zinc-400 hover:text-amber-500 transition-colors flex items-center gap-1"
                  >
                    <Send size={16} />
                    Telegram
                  </a>
                )}
                {feedbackEmail && (
                  <a
                    href={`mailto:${feedbackEmail}`}
                    className="text-sm text-zinc-400 hover:text-amber-500 transition-colors flex items-center gap-1"
                  >
                    <Mail size={16} />
                    Почта
                  </a>
                )}
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}