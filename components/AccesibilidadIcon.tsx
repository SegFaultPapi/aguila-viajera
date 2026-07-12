import { Excursion } from "@/lib/types";

export function nivelAccesibilidad(ex: Excursion): {
  emoji: string;
  label: string;
} {
  const { tieneEscaleras, tienePuentesSinRampa, terrenoIrregular } = ex.accesibilidad;
  const problemas = [tieneEscaleras, tienePuentesSinRampa, terrenoIrregular].filter(Boolean).length;
  if (problemas === 0) return { emoji: "✅", label: "Ruta accesible" };
  if (problemas === 1) return { emoji: "🦯", label: "Ruta con algún obstáculo" };
  return { emoji: "♿⚠️", label: "Ruta con varios obstáculos" };
}

export function AccesibilidadBadge({ excursion }: { excursion: Excursion }) {
  const { emoji, label } = nivelAccesibilidad(excursion);
  const { tieneEscaleras, tienePuentesSinRampa, terrenoIrregular } = excursion.accesibilidad;
  const problemas = [tieneEscaleras, tienePuentesSinRampa, terrenoIrregular].filter(Boolean).length;
  const claseExtra = problemas === 0 ? "badge-success" : problemas === 1 ? "badge-accent" : "";
  const estiloAlerta =
    problemas > 1 ? { background: "var(--color-alert-bg)", color: "var(--color-alert)" } : undefined;

  return (
    <span className={`badge ${claseExtra}`} style={estiloAlerta}>
      <span aria-hidden>{emoji}</span> {label}
    </span>
  );
}
