import { Excursion } from "@/lib/types";

export function nivelAccesibilidad(ex: Excursion): {
  emoji: string;
  label: string;
} {
  const { tieneEscaleras, tienePuentesSinRampa, terrenoIrregular } = ex.accesibilidad;
  const problemas = [tieneEscaleras, tienePuentesSinRampa, terrenoIrregular].filter(Boolean).length;
  if (problemas === 0) return { emoji: "✅", label: "Accesible" };
  if (problemas === 1) return { emoji: "🦯", label: "Con obstáculos" };
  return { emoji: "♿", label: "Varios obstáculos" };
}

export function AccesibilidadBadge({
  excursion,
  icon = true,
}: {
  excursion: Excursion;
  /** Set to false on the emoji-free landing page. */
  icon?: boolean;
}) {
  const { emoji, label } = nivelAccesibilidad(excursion);
  const { tieneEscaleras, tienePuentesSinRampa, terrenoIrregular } = excursion.accesibilidad;
  const problemas = [tieneEscaleras, tienePuentesSinRampa, terrenoIrregular].filter(Boolean).length;
  const claseExtra = problemas === 0 ? "badge-success" : problemas === 1 ? "badge-accent" : "";
  const estiloAlerta =
    problemas > 1 ? { background: "var(--color-alert-bg)", color: "var(--color-alert)" } : undefined;

  return (
    <span className={`badge flex-shrink-0 ${claseExtra}`} style={estiloAlerta}>
      {icon && <span aria-hidden>{emoji}</span>} {label}
    </span>
  );
}
