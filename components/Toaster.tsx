"use client";

import { useEffect, useState } from "react";
import { useToast, Toast } from "@/lib/toast";

/* ── Colores por tipo ────────────────────────────────────── */

function toastStyle(type: Toast["type"]): React.CSSProperties {
  if (type === "error") {
    return {
      background: "var(--color-alert-bg)",
      border: "1.5px solid var(--color-alert)",
      color: "var(--color-alert)",
    };
  }
  if (type === "info") {
    return {
      background: "var(--color-primary-soft)",
      border: "1.5px solid var(--color-primary)",
      color: "var(--color-primary-dark)",
    };
  }
  return {
    background: "var(--color-success-bg)",
    border: "1.5px solid var(--color-success)",
    color: "var(--color-success)",
  };
}

function toastIcon(type: Toast["type"]) {
  if (type === "error") return "✕";
  if (type === "info") return "ℹ";
  return "✓";
}

/* ── Toast individual con animación enter/exit ───────────── */

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);

  // Enter
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  // Exit animation: recibe señal externa cerrando con fade
  // (el dismiss real lo gestiona el provider después del timeout)

  return (
    <div
      role="status"
      aria-live="polite"
      onClick={onDismiss}
      style={{
        ...toastStyle(toast.type),
        borderRadius: "var(--radius-md)",
        padding: "0.85rem 1.1rem",
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
        boxShadow: "var(--shadow-md)",
        cursor: "pointer",
        maxWidth: "360px",
        width: "100%",
        transition: "opacity 0.25s ease, transform 0.25s ease",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-10px)",
        userSelect: "none",
      }}
    >
      <span
        style={{
          flexShrink: 0,
          width: "1.5rem",
          height: "1.5rem",
          borderRadius: "999px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.85rem",
          fontWeight: 800,
          background: "currentColor",
          color: toastStyle(toast.type).background as string,
        }}
        aria-hidden
      >
        {toastIcon(toast.type)}
      </span>
      <span style={{ fontSize: "1rem", fontWeight: 600, lineHeight: 1.3 }}>
        {toast.message}
      </span>
    </div>
  );
}

/* ── Contenedor global ───────────────────────────────────── */

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Notificaciones"
      style={{
        position: "fixed",
        top: "1rem",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        alignItems: "center",
        pointerEvents: "none",
        width: "calc(100% - 2rem)",
        maxWidth: "400px",
      }}
    >
      {toasts.map((t) => (
        <div key={t.id} style={{ width: "100%", pointerEvents: "auto" }}>
          <ToastItem toast={t} onDismiss={() => dismiss(t.id)} />
        </div>
      ))}
    </div>
  );
}
