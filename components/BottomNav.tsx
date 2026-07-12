"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";

export function BottomNav() {
  const pathname = usePathname();
  const { currentUser } = useStore();

  const isCoord = currentUser.rol === "coordinador";

  const tabs = isCoord
    ? [
        { href: "/coordinador", icon: "🏠", label: "Inicio" },
        { href: "/excursiones", icon: "🗺️", label: "Excursiones" },
        { href: "/coordinador/nueva-excursion", icon: "➕", label: "Nueva" },
      ]
    : [
        { href: "/excursiones", icon: "🗺️", label: "Excursiones" },
        { href: "/mis-excursiones", icon: "🎟️", label: "Mis reservas" },
        { href: "/perfil-salud", icon: "🩺", label: "Mi info" },
      ];

  function isActive(href: string) {
    if (href === "/coordinador") return pathname === "/coordinador";
    if (href === "/excursiones")
      return (
        pathname === "/excursiones" ||
        (pathname?.startsWith("/excursiones") &&
          !pathname.startsWith("/excursiones/"))
      );
    return pathname?.startsWith(href);
  }

  return (
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
      </div>
    </nav>
  );
}
