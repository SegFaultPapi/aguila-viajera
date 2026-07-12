export function PlaceholderImage({
  label = "Imagen",
  className = "",
  aspect = "aspect-[4/3]",
}: {
  label?: string;
  className?: string;
  aspect?: string;
}) {
  return (
    <div
      className={`placeholder-image ${aspect} ${className}`}
      role="img"
      aria-label="Espacio reservado para una imagen"
    >
      {label}
    </div>
  );
}
