"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { AccesibilidadBadge } from "@/components/AccesibilidadIcon";
import { Excursion } from "@/lib/types";

/* ── Helpers ────────────────────────────────────────────── */

function fechaChip(fecha: string) {
  const d = new Date(fecha + "T12:00:00");
  const dia = d.toLocaleDateString("es-MX", { day: "numeric" });
  const mes = d.toLocaleDateString("es-MX", { month: "short" }).replace(".", "").toUpperCase();
  return { dia, mes };
}

/* ── Tarjeta de excursión ───────────────────────────────── */

function ExcursionCard({
  excursion,
  coordinadorNombre,
  inscritosConfirmados,
  esCoordinador,
}: {
  excursion: Excursion;
  coordinadorNombre: string;
  inscritosConfirmados: number;
  esCoordinador: boolean;
}) {
  const router = useRouter();
  const { dia, mes } = fechaChip(excursion.fecha);
  const pct = Math.min((inscritosConfirmados / excursion.cupoMaximo) * 100, 100);
  const cupoLleno = inscritosConfirmados >= excursion.cupoMaximo;
  const pocosLugares = !cupoLleno && pct >= 75;
  const href = `/excursiones/${excursion.id}`;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(href)}
      onKeyDown={(e) => e.key === "Enter" && router.push(href)}
      className="card card-interactive flex cursor-pointer gap-4 no-underline"
      style={{ textDecoration: "none" }}
    >
      {/* Chip de fecha */}
      <div
        className="flex flex-col items-center justify-center flex-shrink-0 rounded-2xl px-3 py-2 text-center"
        style={{
          background: "var(--color-primary-soft)",
          minWidth: "56px",
        }}
      >
        <span className="text-2xl font-extrabold leading-none" style={{ color: "var(--color-primary)" }}>
          {dia}
        </span>
        <span className="text-sm font-bold uppercase" style={{ color: "var(--color-primary)" }}>
          {mes}
        </span>
      </div>

      {/* Contenido */}
      <div className="flex flex-1 flex-col gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-2xl flex-shrink-0" aria-hidden>{excursion.imagenEmoji}</span>
          <h2 className="text-xl font-extrabold leading-tight truncate">{excursion.destino}</h2>
        </div>

        <p className="text-base" style={{ color: "var(--color-ink-soft)" }}>
          📍 {excursion.colonia} · {excursion.horaSalida}h
        </p>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: "var(--color-ink-soft)" }}>
            {cupoLleno ? "Cupo lleno" : pocosLugares ? `${excursion.cupoMaximo - inscritosConfirmados} lugares disponibles` : `${inscritosConfirmados}/${excursion.cupoMaximo} inscritos`}
          </span>
          {excursion.costo === 0 && (
            <span className="badge badge-success">Gratuito</span>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <AccesibilidadBadge excursion={excursion} />
          {excursion.requiereAcompanante && (
            <span className="badge" style={{ background: "var(--color-accent-soft)", color: "var(--color-accent-dark)" }}>
              👥 Requiere acompañante
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
            Coordina: {coordinadorNombre}
          </p>
          {esCoordinador && (
            <Link
              href={`/coordinador/excursiones/${excursion.id}/participantes`}
              className="text-sm font-bold"
              style={{ color: "var(--color-primary)" }}
              onClick={(e) => e.stopPropagation()}
            >
              Panel →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────── */

export default function ListadoExcursiones() {
  const { excursiones, usuarios, currentUser, inscripcionesDe } = useStore();

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
    <div className="flex flex-col gap-5">
      {/* Cabecera */}
      <div>
        <h1 className="text-3xl font-extrabold">Próximas excursiones</h1>
        <p className="mt-0.5 text-base" style={{ color: "var(--color-ink-soft)" }}>
          Organizadas por comisiones COPACO en Iztapalapa.
        </p>
      </div>

      {/* Filtro */}
      <div className="flex items-center gap-2">
        <span className="text-base font-semibold" style={{ color: "var(--color-ink-soft)" }}>
          Colonia:
        </span>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["todas", ...colonias].map((c) => (
            <button
              key={c}
              onClick={() => setColonia(c)}
              className="flex-shrink-0 rounded-full px-3 py-1.5 text-base font-semibold transition-all"
              style={{
                background: colonia === c ? "var(--color-primary)" : "var(--color-bg-alt)",
                color: colonia === c ? "white" : "var(--color-ink-soft)",
                border: "1px solid",
                borderColor: colonia === c ? "var(--color-primary)" : "var(--color-border)",
                minHeight: "36px",
              }}
            >
              {c === "todas" ? "Todas" : c}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className="flex flex-col gap-4">
        {visibles.map((ex) => {
          const coordinador = usuarios.find((u) => u.id === ex.coordinadorId);
          const inscritos = inscripcionesDe(ex.id).filter((i) => i.estado === "confirmada").length;
          const esCoord = currentUser.rol === "coordinador" && currentUser.id === ex.coordinadorId;
          return (
            <ExcursionCard
              key={ex.id}
              excursion={ex}
              coordinadorNombre={coordinador?.nombre ?? "—"}
              inscritosConfirmados={inscritos}
              esCoordinador={esCoord}
            />
          );
        })}
        {visibles.length === 0 && (
          <div
            className="card flex flex-col items-center gap-3 py-10 text-center"
            style={{ color: "var(--color-ink-soft)" }}
          >
            <span className="text-4xl" aria-hidden>🗺️</span>
            <p className="font-semibold">No hay excursiones para esta colonia todavía.</p>
            {currentUser.rol === "coordinador" && (
              <Link href="/coordinador/nueva-excursion" className="btn-primary">
                Crear la primera excursión →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
