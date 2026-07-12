"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";

const NAV_LINKS = [
  { href: "/excursiones", label: "Excursiones" },
  { href: "/perfil-salud", label: "Perfil de salud" },
  { href: "/coordinador/nueva-excursion", label: "Panel coordinador" },
];

export function Header() {
  const { usuarios, currentUserId, setCurrentUserId } = useStore();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b bg-white" style={{ borderColor: "var(--color-border)" }}>
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex flex-shrink-0 items-center gap-1.5 text-lg font-extrabold" style={{ color: "var(--color-primary)" }}>
          <span aria-hidden>🦅</span> Águila Viajera
        </Link>
        <nav className="flex flex-nowrap items-center gap-4 overflow-x-auto text-sm font-medium">
          {NAV_LINKS.map((link) => {
            const active = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={active ? "underline underline-offset-4" : "text-inherit"}
                style={{ color: active ? "var(--color-primary)" : "var(--color-ink-soft)" }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div
        className="border-t px-4 py-2"
        style={{ borderColor: "var(--color-border)", background: "var(--color-bg-alt)" }}
      >
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-2 text-sm">
          <span className="badge badge-accent">Modo demostración</span>
          <label htmlFor="usuario-actual" style={{ color: "var(--color-ink-soft)" }}>
            Viendo como:
          </label>
          <select
            id="usuario-actual"
            value={currentUserId}
            onChange={(e) => setCurrentUserId(e.target.value)}
            className="rounded-lg border bg-white px-2 py-1"
            style={{ borderColor: "var(--color-border)" }}
          >
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre} ({rolLabel(u.rol)})
              </option>
            ))}
          </select>
          <span className="hidden sm:inline" style={{ color: "var(--color-ink-soft)" }}>
            — sin autenticación real, el rol se reinicia al recargar.
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
