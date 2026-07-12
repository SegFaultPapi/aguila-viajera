"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";

const NAV_LINKS_COORDINADOR = [
  { href: "/excursiones", label: "Excursiones" },
  { href: "/coordinador/nueva-excursion", label: "Nueva excursión" },
];

const NAV_LINKS_USUARIO = [
  { href: "/excursiones", label: "Excursiones" },
  { href: "/mis-excursiones", label: "Mis reservas" },
  { href: "/perfil-salud", label: "Mi información" },
];

export function Header() {
  const { currentUser } = useStore();
  const pathname = usePathname();
  const navLinks =
    currentUser.rol === "coordinador" ? NAV_LINKS_COORDINADOR : NAV_LINKS_USUARIO;

  return (
    <header
      className="sticky top-0 z-10 border-b bg-white"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        {/* Logo */}
        <Link
          href="/"
          className="flex flex-shrink-0 items-center gap-2 whitespace-nowrap text-lg font-extrabold"
          style={{ color: "var(--color-primary)" }}
        >
          <Image
            src="/images/ui/logo-aguila.png"
            alt="Águila Viajera"
            width={56}
            height={56}
            className="flex-shrink-0"
            priority
          />
          <span className="hidden xs:inline">Águila Viajera</span>
        </Link>

        {/* Nav — solo desktop */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
          {navLinks.map((link) => {
            const active = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex-shrink-0 pb-0.5 transition-colors"
                style={{
                  color: active ? "var(--color-primary)" : "var(--color-ink-soft)",
                  borderBottom: active ? "2px solid var(--color-primary)" : "2px solid transparent",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Chip de usuario activo */}
        <div
          className="flex items-center gap-2 rounded-full border px-3 py-1.5"
          style={{ borderColor: "var(--color-border)", background: "var(--color-bg-alt)" }}
        >
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-extrabold text-white flex-shrink-0"
            style={{ background: "var(--color-primary)" }}
            aria-hidden
          >
            {currentUser.nombre.charAt(0)}
          </span>
          <span className="text-sm font-semibold truncate max-w-[120px]">
            {currentUser.nombre.split(" ")[0]}
          </span>
          <span
            className="hidden sm:inline text-xs rounded-full px-2 py-0.5 font-semibold"
            style={{
              background: rolColor(currentUser.rol).bg,
              color: rolColor(currentUser.rol).text,
            }}
          >
            {rolLabel(currentUser.rol)}
          </span>
        </div>
      </div>
    </header>
  );
}

function rolLabel(rol: string) {
  if (rol === "adulto_mayor") return "adulto mayor";
  if (rol === "familiar") return "familiar";
  return "coordinador";
}

function rolColor(rol: string) {
  if (rol === "coordinador") return { bg: "#ede9fe", text: "#5b21b6" };
  if (rol === "familiar") return { bg: "var(--color-accent-soft)", text: "var(--color-accent-dark)" };
  return { bg: "var(--color-primary-soft)", text: "var(--color-primary-dark)" };
}
