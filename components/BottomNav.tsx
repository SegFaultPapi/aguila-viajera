"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";

function rolLabel(rol: string) {
  if (rol === "adulto_mayor") return "Adulto mayor";
  if (rol === "familiar") return "Familiar";
  return "Coordinador";
}

export function BottomNav() {
  const pathname = usePathname();
  const { currentUser, usuarios, currentUserId, setCurrentUserId } = useStore();
  const [demoAbierto, setDemoAbierto] = useState(false);

  const isCoord = currentUser.rol === "coordinador";

  const tabs = isCoord
    ? [
        { href: "/excursiones", icon: "🗺️", label: "Excursiones" },
        { href: "/coordinador/nueva-excursion", icon: "➕", label: "Nueva" },
      ]
    : [
        { href: "/excursiones", icon: "🗺️", label: "Excursiones" },
        { href: "/mis-excursiones", icon: "🎟️", label: "Mis reservas" },
        { href: "/perfil-salud", icon: "🩺", label: "Mi info" },
      ];

  function isActive(href: string) {
    if (href === "/excursiones")
      return (
        pathname === "/excursiones" ||
        (pathname?.startsWith("/excursiones") &&
          !pathname.startsWith("/excursiones/"))
      );
    return pathname?.startsWith(href);
  }

  return (
    <>
      {/* Overlay del panel demo */}
      {demoAbierto && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setDemoAbierto(false)}
        />
      )}

      {/* Panel de demo */}
      {demoAbierto && (
        <div
          className="fixed bottom-20 left-1/2 z-40 w-full max-w-sm -translate-x-1/2 rounded-2xl border shadow-lg"
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

      {/* Barra inferior */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-20 border-t bg-white"
        style={{ borderColor: "var(--color-border)" }}
        aria-label="Navegación principal"
      >
        <div className="mx-auto flex max-w-3xl items-stretch">
          {tabs.map((tab) => {
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-1 flex-col items-center justify-center gap-1 py-3 transition-colors"
                style={{
                  color: active ? "var(--color-primary)" : "var(--color-ink-soft)",
                  borderTop: active ? `2px solid var(--color-primary)` : "2px solid transparent",
                }}
                aria-current={active ? "page" : undefined}
              >
                <span className="text-2xl leading-none" aria-hidden>{tab.icon}</span>
                <span
                  className="text-xs font-semibold leading-none"
                  style={{ color: active ? "var(--color-primary)" : "var(--color-ink-soft)" }}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}

          {/* Tab "Yo" — abre panel demo */}
          <button
            onClick={() => setDemoAbierto((v) => !v)}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-3 transition-colors"
            style={{
              color: demoAbierto ? "var(--color-primary)" : "var(--color-ink-soft)",
              borderTop: demoAbierto ? `2px solid var(--color-primary)` : "2px solid transparent",
            }}
            aria-label="Cambiar usuario de demostración"
          >
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-extrabold"
              style={{
                background: demoAbierto ? "var(--color-primary)" : "var(--color-bg-alt)",
                color: demoAbierto ? "white" : "var(--color-ink)",
              }}
            >
              {currentUser.nombre.charAt(0)}
            </span>
            <span className="text-xs font-semibold leading-none">
              {currentUser.nombre.split(" ")[0]}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
