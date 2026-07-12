import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["700", "800", "900"],
});

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
    <html lang="es" className={`h-full antialiased ${manrope.variable} ${playfair.variable}`}>
      <body className="min-h-full flex flex-col" style={{ background: "var(--color-bg)" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
