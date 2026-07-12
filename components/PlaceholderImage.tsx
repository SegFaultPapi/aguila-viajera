export function PlaceholderImage({
  label = "Imagen",
  className = "",
  aspect = "aspect-[4/3]",
  shape = "rect",
  size,
}: {
  label?: string;
  className?: string;
  aspect?: string;
  /** "circle" para fotos de perfil/avatar; "rect" para portadas de contenido. */
  shape?: "rect" | "circle";
  /**
   * Ancho/alto fijo en px (p. ej. un avatar de 64px). Pásalo cuando el
   * placeholder vive dentro de un flex row: la clase base fuerza
   * `width: 100%` con CSS sin capa, que le gana a utilidades de Tailwind
   * como `w-16` (viven en `@layer utilities`), así que un tamaño fijo
   * necesita fijarse por estilo inline, no por className.
   */
  size?: number;
}) {
  return (
    <div
      className={`placeholder-image ${aspect} ${className}`}
      style={{
        ...(shape === "circle" ? { borderRadius: "999px" } : {}),
        ...(size ? { width: size, height: size, flexShrink: 0 } : {}),
      }}
      role="img"
      aria-label="Espacio reservado para una imagen"
    >
      {label}
    </div>
  );
}
