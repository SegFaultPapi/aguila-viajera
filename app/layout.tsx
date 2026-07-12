import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/lib/providers";

export const metadata: Metadata = {
  title: "Águila Viajera — COPACO Iztapalapa",
  description: "Plataforma digital comunitaria para COPACO — excursiones seguras para adultos mayores en Iztapalapa, CDMX",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col" style={{ background: "var(--color-bg)" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
