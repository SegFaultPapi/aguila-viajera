"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { AccesibilidadBadge } from "@/components/AccesibilidadIcon";

export default function ListadoExcursiones() {
  const router = useRouter();
  const { excursiones, usuarios, currentUser } = useStore();
  const colonias = useMemo(
    () => Array.from(new Set(excursiones.map((e) => e.colonia))),
    [excursiones]
  );
  const [colonia, setColonia] = useState("todas");

  const visibles = excursiones
    .filter((e) => e.estado === "publicada")
    .filter((e) => colonia === "todas" || e.colonia === colonia)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Próximas excursiones</h1>
        <p className="mt-1 text-lg" style={{ color: "var(--color-ink-soft)" }}>
          Organizadas por tu comisión COPACO. Inscríbete tú, o pide a un familiar vinculado que lo
          haga por ti.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <label htmlFor="filtro-colonia" className="font-medium">
          Colonia:
        </label>
        <select
          id="filtro-colonia"
          value={colonia}
          onChange={(e) => setColonia(e.target.value)}
          className="rounded-lg border bg-white px-3 py-2"
          style={{ borderColor: "var(--color-border)" }}
        >
          <option value="todas">Todas</option>
          {colonias.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-4">
        {visibles.map((ex) => {
          const coordinador = usuarios.find((u) => u.id === ex.coordinadorId);
          return (
            <div
              key={ex.id}
              role="button"
              tabIndex={0}
              onClick={() => router.push(`/excursiones/${ex.id}`)}
              onKeyDown={(e) => e.key === "Enter" && router.push(`/excursiones/${ex.id}`)}
              className="card card-interactive flex cursor-pointer gap-4"
            >
              <div
                className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl text-3xl"
                style={{ background: "var(--color-primary-soft)" }}
                aria-hidden
              >
                {ex.imagenEmoji}
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <h2 className="text-lg font-bold">{ex.destino}</h2>
                <p style={{ color: "var(--color-ink-soft)" }}>
                  {formatFecha(ex.fecha)} · {ex.colonia}
                </p>
                <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
                  Coordina: {coordinador?.nombre}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <AccesibilidadBadge excursion={ex} />
                  {ex.costo === 0 && <span className="badge badge-success">Gratuito</span>}
                </div>
                {currentUser.rol === "coordinador" && currentUser.id === ex.coordinadorId && (
                  <Link
                    href={`/coordinador/excursiones/${ex.id}/participantes`}
                    className="mt-1 w-fit text-sm font-semibold underline"
                    style={{ color: "var(--color-primary)" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Ver participantes →
                  </Link>
                )}
              </div>
              <div
                className="hidden self-center text-sm font-semibold sm:block"
                style={{ color: "var(--color-primary)" }}
              >
                Ver detalle →
              </div>
            </div>
          );
        })}
        {visibles.length === 0 && (
          <div className="card text-center" style={{ color: "var(--color-ink-soft)" }}>
            No hay excursiones publicadas para esta colonia todavía.
          </div>
        )}
      </div>
    </div>
  );
}

function formatFecha(fecha: string) {
  const d = new Date(fecha + "T12:00:00");
  return d.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
}
