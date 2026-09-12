import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { Header } from "@/components/layout/Header";

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
  return (
    <html lang="ru" className="dark">
      <body className={`${inter.variable} font-sans`}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="border-t py-6 text-center text-sm text-zinc-500">
          <p>© 2026 TarkovDocs. Не является официальным продуктом Battlestate Games.</p>
        </footer>
      </body>
    </html>
  );
}