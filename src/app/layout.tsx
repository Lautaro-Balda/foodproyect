import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Food Proyect",
  description: "Inventario, recetas y compras inteligentes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-8 sm:px-6">
          <nav className="mb-10 flex items-center gap-6 border-b border-border pb-4">
            <Link
              href="/"
              className="text-sm font-semibold tracking-tight text-foreground"
            >
              Food Proyect
            </Link>
            <Link
              href="/inventario"
              className="text-sm text-muted transition hover:text-accent"
            >
              Inventario
            </Link>
            <Link
              href="/recetas"
              className="text-sm text-muted transition hover:text-accent"
            >
              Recetas
            </Link>
          </nav>
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
