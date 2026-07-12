"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";

const NAV_LINKS_COORDINADOR = [
  { href: "/coordinador", label: "Mi panel" },
  { href: "/excursiones", label: "Excursiones" },
  { href: "/coordinador/nueva-excursion", label: "Nueva excursión" },
];

const NAV_LINKS_USUARIO = [
  { href: "/excursiones", label: "Excursiones" },
  { href: "/mis-excursiones", label: "Mis reservas" },
  { href: "/perfil-salud", label: "Mi información" },
];

export function Header() {
  const { currentUser, usuarios, currentUserId, setCurrentUserId } = useStore();
  const pathname = usePathname();
  const [demoAbierto, setDemoAbierto] = useState(false);
  const navLinks =
    currentUser.rol === "coordinador" ? NAV_LINKS_COORDINADOR : NAV_LINKS_USUARIO;

  return (
    <>
      {/* Overlay para cerrar el panel demo */}
      {demoAbierto && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setDemoAbierto(false)}
        />
      )}

      <header
        className="sticky top-0 z-40 border-b bg-white"
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
              const active =
                link.href === "/coordinador"
                  ? pathname === "/coordinador"
                  : pathname?.startsWith(link.href);
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

          {/* Chip de usuario activo — abre panel demo */}
          <div className="relative">
            <button
              onClick={() => setDemoAbierto((v) => !v)}
              className="flex items-center gap-2 rounded-full border px-3 py-1.5 transition-colors"
              style={{
                borderColor: demoAbierto ? "var(--color-primary)" : "var(--color-border)",
                background: demoAbierto ? "var(--color-primary-soft)" : "var(--color-bg-alt)",
              }}
              aria-label="Cambiar usuario de demostración"
              aria-expanded={demoAbierto}
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
              <span
                className="text-xs ml-0.5"
                style={{ color: "var(--color-ink-soft)" }}
                aria-hidden
              >
                {demoAbierto ? "▲" : "▼"}
              </span>
            </button>

            {/* Panel de demo — dropdown */}
            {demoAbierto && (
              <div
                className="absolute right-0 top-full mt-2 w-72 rounded-2xl border shadow-lg z-50"
                style={{
                  background: "white",
                  borderColor: "var(--color-border)",
                  boxShadow: "var(--shadow-lg)",
                }}
              >
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="badge badge-accent text-xs">Modo demostración</span>
                    <button
                      onClick={() => setDemoAbierto(false)}
                      className="text-xl leading-none"
                      style={{ color: "var(--color-ink-soft)" }}
                      aria-label="Cerrar"
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-sm font-semibold">Viendo como:</p>
                  <div className="flex flex-col gap-2">
                    {usuarios.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => { setCurrentUserId(u.id); setDemoAbierto(false); }}
                        className="flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-colors"
                        style={{
                          borderColor: u.id === currentUserId ? "var(--color-primary)" : "var(--color-border)",
                          background: u.id === currentUserId ? "var(--color-primary-soft)" : "transparent",
                        }}
                      >
                        <span
                          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-lg font-extrabold"
                          style={{
                            background: u.id === currentUserId ? "var(--color-primary)" : "var(--color-bg-alt)",
                            color: u.id === currentUserId ? "white" : "var(--color-ink-soft)",
                          }}
                        >
                          {u.nombre.charAt(0)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold truncate">{u.nombre}</p>
                          <p className="text-xs" style={{ color: "var(--color-ink-soft)" }}>
                            {rolLabel(u.rol)}
                          </p>
                        </div>
                        {u.id === currentUserId && (
                          <span style={{ color: "var(--color-primary)" }}>✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-center" style={{ color: "var(--color-ink-soft)" }}>
                    Sin auth real · se reinicia al recargar
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
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
