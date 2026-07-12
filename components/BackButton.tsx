"use client";

import { useRouter } from "next/navigation";

export function BackButton({
  href,
  label = "Volver",
}: {
  /** Ruta destino. Si se omite, navega hacia atrás en el historial. */
  href?: string;
  label?: string;
}) {
  const router = useRouter();
  return (
    <button
      onClick={() => (href ? router.push(href) : router.back())}
      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors flex-shrink-0"
      style={{
        background: "var(--color-bg-alt)",
        color: "var(--color-ink-soft)",
        minHeight: "36px",
        width: "fit-content",
      }}
    >
      ← {label}
    </button>
  );
}
