"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { Excursion } from "@/lib/types";
import { PlaceholderImage } from "@/components/PlaceholderImage";

/* ── Helpers ────────────────────────────────────────────── */

const HOY = new Date().toISOString().slice(0, 10);

function fechaRelativa(fecha: string): string {
  const diff = Math.round(
    (new Date(fecha + "T12:00:00").getTime() - new Date(HOY + "T12:00:00").getTime()) /
      86_400_000
  );
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Mañana";
  if (diff <= 7) return `En ${diff} días`;
  return new Date(fecha + "T12:00:00").toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
  });
}

function fechaLarga(fecha: string) {
  return new Date(fecha + "T12:00:00").toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/* ── Thumbnail ───────────────────────────────────────────── */

function ExcursionThumb({ id, emoji, rounded = "all" }: { id: string; emoji: string; rounded?: "all" | "top" }) {
  const [error, setError] = useState(false);
  const borderRadius =
    rounded === "top" ? "1.25rem 1.25rem 0 0" : "var(--radius-lg)";

  if (error) {
    return (
      <div style={{ borderRadius, overflow: "hidden" }}>
        <PlaceholderImage label={emoji} aspect="aspect-[3/2]" />
      </div>
    );
  }

  return (
    <img
      src={`/images/excursiones/${id}.jpg`}
      alt=""
      aria-hidden
      onError={() => setError(true)}
      style={{ width: "100%", aspectRatio: "3 / 2", objectFit: "cover", borderRadius, display: "block" }}
    />
  );
}

/* ── Stat chip ───────────────────────────────────────────── */

function StatChip({
  valor,
  etiqueta,
  color = "primary",
}: {
  valor: number | string;
  etiqueta: string;
  color?: "primary" | "accent" | "success";
}) {
  const bg =
    color === "accent"
      ? "var(--color-accent-soft)"
      : color === "success"
      ? "var(--color-success-bg)"
      : "var(--color-primary-soft)";
  const text =
    color === "accent"
      ? "var(--color-accent-dark)"
      : color === "success"
      ? "var(--color-success)"
      : "var(--color-primary)";

  return (
    <div
      className="flex flex-1 flex-col items-center rounded-2xl py-4 px-2 text-center"
      style={{ background: bg }}
    >
      <span className="text-3xl font-extrabold leading-none" style={{ color: text }}>
        {valor}
      </span>
      <span className="mt-1 text-xs font-semibold leading-snug" style={{ color: text }}>
        {etiqueta}
      </span>
    </div>
  );
}

/* ── Tarjeta de excursión propia ─────────────────────────── */

function TarjetaMiaCard({ excursion, inscritos }: { excursion: Excursion; inscritos: number }) {
  const router = useRouter();
  const pct = Math.min((inscritos / excursion.cupoMaximo) * 100, 100);
  const cupoLleno = inscritos >= excursion.cupoMaximo;
  const esHoy = excursion.fecha === HOY;
  const href = `/coordinador/excursiones/${excursion.id}/participantes`;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(href)}
      onKeyDown={(e) => e.key === "Enter" && router.push(href)}
      className="card card-interactive cursor-pointer overflow-hidden"
      style={{ padding: 0 }}
    >
      <ExcursionThumb id={excursion.id} emoji={excursion.imagenEmoji} rounded="top" />

      <div className="flex flex-col gap-3 p-5">
        {/* Encabezado */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-xl font-extrabold leading-tight">{excursion.destino}</h3>
            <p className="text-base mt-0.5 capitalize" style={{ color: "var(--color-ink-soft)" }}>
              {fechaLarga(excursion.fecha)} · {excursion.horaSalida}h
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span
              className="badge"
              style={{
                background: esHoy
                  ? "var(--color-primary)"
                  : "var(--color-primary-soft)",
                color: esHoy ? "white" : "var(--color-primary)",
              }}
            >
              {fechaRelativa(excursion.fecha)}
            </span>
            {excursion.estado === "reprogramada" && (
              <span
                className="badge"
                style={{
                  background: "var(--color-accent-soft)",
                  color: "var(--color-accent-dark)",
                }}
              >
                Reprogramada
              </span>
            )}
          </div>
        </div>

        {/* Barra de cupo */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold" style={{ color: "var(--color-ink-soft)" }}>
              {cupoLleno ? "Cupo completo" : `${inscritos} de ${excursion.cupoMaximo} inscritos`}
            </span>
            <span className="text-sm font-bold" style={{ color: "var(--color-primary)" }}>
              {Math.round(pct)}%
            </span>
          </div>
          <div
            className="h-2 w-full overflow-hidden rounded-full"
            style={{ background: "var(--color-bg-alt)" }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${pct}%`,
                background: cupoLleno ? "var(--color-accent)" : "var(--color-primary)",
              }}
            />
          </div>
        </div>

        {/* CTA */}
        <Link
          href={href}
          className="btn-primary text-center text-base"
          style={{ minHeight: "48px", lineHeight: "48px", padding: "0 1.25rem" }}
          onClick={(e) => e.stopPropagation()}
        >
          {esHoy ? "Abrir check-in →" : "Ver participantes →"}
        </Link>
      </div>
    </div>
  );
}

/* ── Tarjeta de excursión de hoy (hero) ──────────────────── */

function HeroHoy({ excursion, inscritos }: { excursion: Excursion; inscritos: number }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        border: "2px solid var(--color-primary)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <ExcursionThumb id={excursion.id} emoji={excursion.imagenEmoji} rounded="top" />
      <div
        className="flex flex-col gap-4 p-5"
        style={{ background: "var(--color-primary-soft)" }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="badge text-sm font-extrabold"
              style={{ background: "var(--color-primary)", color: "white" }}
            >
              HOY
            </span>
            <span className="text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
              Sale {excursion.horaSalida}h · Regresa {excursion.horaRegreso}h
            </span>
          </div>
          <h2 className="text-2xl font-extrabold" style={{ color: "var(--color-primary-dark)" }}>
            {excursion.destino}
          </h2>
          <p className="text-base mt-0.5" style={{ color: "var(--color-primary)" }}>
            📍 {excursion.puntoSalida}
          </p>
        </div>

        <div
          className="flex items-center justify-between rounded-xl px-4 py-3"
          style={{ background: "white" }}
        >
          <div className="text-center">
            <p className="text-2xl font-extrabold" style={{ color: "var(--color-primary)" }}>
              {inscritos}
            </p>
            <p className="text-xs font-semibold" style={{ color: "var(--color-ink-soft)" }}>
              confirmados
            </p>
          </div>
          <div
            className="h-10 w-px"
            style={{ background: "var(--color-border)" }}
            aria-hidden
          />
          <div className="text-center">
            <p className="text-2xl font-extrabold" style={{ color: "var(--color-ink-soft)" }}>
              {excursion.cupoMaximo}
            </p>
            <p className="text-xs font-semibold" style={{ color: "var(--color-ink-soft)" }}>
              cupo total
            </p>
          </div>
          <div
            className="h-10 w-px"
            style={{ background: "var(--color-border)" }}
            aria-hidden
          />
          <div className="text-center">
            <p className="text-2xl font-extrabold" style={{ color: "var(--color-accent-dark)" }}>
              {excursion.cupoMaximo - inscritos}
            </p>
            <p className="text-xs font-semibold" style={{ color: "var(--color-ink-soft)" }}>
              disponibles
            </p>
          </div>
        </div>

        <Link
          href={`/coordinador/excursiones/${excursion.id}/participantes`}
          className="btn-primary text-center text-lg"
          style={{ minHeight: "56px", lineHeight: "56px", padding: "0 1.25rem" }}
        >
          Abrir check-in →
        </Link>
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────── */

export default function CoordinadorHome() {
  const { currentUser, excursiones, inscripcionesDe } = useStore();

  // Solo coordinadores pueden ver esta página
  if (currentUser.rol !== "coordinador") {
    return (
      <div className="card text-center py-12" style={{ color: "var(--color-ink-soft)" }}>
        <p className="text-lg font-semibold">Esta sección es solo para coordinadores.</p>
      </div>
    );
  }

  const misExcursiones = useMemo(
    () => excursiones.filter((e) => e.coordinadorId === currentUser.id),
    [excursiones, currentUser.id]
  );

  const activas = useMemo(
    () =>
      misExcursiones
        .filter((e) => e.estado === "publicada" || e.estado === "reprogramada")
        .sort((a, b) => a.fecha.localeCompare(b.fecha)),
    [misExcursiones]
  );

  const cerradas = useMemo(
    () =>
      misExcursiones
        .filter((e) => e.estado === "cancelada" || e.estado === "completada")
        .sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [misExcursiones]
  );

  const excursionDeHoy = activas.find((e) => e.fecha === HOY);

  // Totales para los stat chips
  const totalInscritos = useMemo(
    () =>
      activas.reduce(
        (sum, e) =>
          sum + inscripcionesDe(e.id).filter((i) => i.estado === "confirmada").length,
        0
      ),
    [activas, inscripcionesDe]
  );

  const totalEspera = useMemo(
    () =>
      activas.reduce(
        (sum, e) =>
          sum + inscripcionesDe(e.id).filter((i) => i.estado === "lista_espera").length,
        0
      ),
    [activas, inscripcionesDe]
  );

  const totalCuposLibres = useMemo(
    () =>
      activas.reduce((sum, e) => {
        const conf = inscripcionesDe(e.id).filter((i) => i.estado === "confirmada").length;
        return sum + Math.max(0, e.cupoMaximo - conf);
      }, 0),
    [activas, inscripcionesDe]
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Saludo */}
      <div>
        <p className="text-base font-semibold" style={{ color: "var(--color-ink-soft)" }}>
          {new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h1 className="text-3xl font-extrabold mt-0.5">
          Hola, {currentUser.nombre.split(" ")[0]}
        </h1>
        <p className="text-base" style={{ color: "var(--color-ink-soft)" }}>
          Coordinador COPACO · {activas.length} excursión{activas.length !== 1 ? "es" : ""} activa{activas.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Stat chips */}
      <div className="flex gap-3">
        <StatChip valor={totalInscritos} etiqueta="confirmados" color="primary" />
        <StatChip valor={activas.length} etiqueta="excursiones activas" color="success" />
        <StatChip
          valor={totalEspera}
          etiqueta={totalEspera === 1 ? "en espera" : "en espera"}
          color="accent"
        />
      </div>

      {/* Excursión de hoy */}
      {excursionDeHoy && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold">Excursión de hoy</h2>
          <HeroHoy
            excursion={excursionDeHoy}
            inscritos={
              inscripcionesDe(excursionDeHoy.id).filter((i) => i.estado === "confirmada")
                .length
            }
          />
        </section>
      )}

      {/* Mis excursiones activas */}
      {activas.filter((e) => e.fecha !== HOY).length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold">
            {excursionDeHoy ? "Próximas excursiones" : "Mis excursiones"}
          </h2>
          <div className="flex flex-col gap-4">
            {activas
              .filter((e) => e.fecha !== HOY)
              .map((ex) => (
                <TarjetaMiaCard
                  key={ex.id}
                  excursion={ex}
                  inscritos={
                    inscripcionesDe(ex.id).filter((i) => i.estado === "confirmada").length
                  }
                />
              ))}
          </div>
        </section>
      )}

      {/* Estado vacío — sin excursiones activas */}
      {activas.length === 0 && (
        <div
          className="card flex flex-col items-center gap-4 py-12 text-center"
          style={{ color: "var(--color-ink-soft)" }}
        >
          <span className="text-5xl" aria-hidden>🗺️</span>
          <div>
            <p className="text-xl font-bold mb-1">Sin excursiones activas</p>
            <p className="text-base">Crea una excursión para empezar a recibir inscripciones.</p>
          </div>
          <Link href="/coordinador/nueva-excursion" className="btn-primary text-base">
            Crear excursión →
          </Link>
        </div>
      )}

      {/* Acciones rápidas */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold">Acciones rápidas</h2>
        <div className="flex flex-col gap-2">
          <Link
            href="/coordinador/nueva-excursion"
            className="card card-interactive flex items-center gap-4 no-underline"
            style={{ textDecoration: "none" }}
          >
            <span
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-2xl"
              style={{ background: "var(--color-primary-soft)" }}
              aria-hidden
            >
              ➕
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold">Crear nueva excursión</p>
              <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
                Llena los datos, cupo y accesibilidad
              </p>
            </div>
            <span className="text-xl" style={{ color: "var(--color-ink-soft)" }} aria-hidden>
              →
            </span>
          </Link>

          <Link
            href="/excursiones"
            className="card card-interactive flex items-center gap-4 no-underline"
            style={{ textDecoration: "none" }}
          >
            <span
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-2xl"
              style={{ background: "var(--color-bg-alt)" }}
              aria-hidden
            >
              🗺️
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold">Ver todas las excursiones</p>
              <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
                Listado completo con filtros
              </p>
            </div>
            <span className="text-xl" style={{ color: "var(--color-ink-soft)" }} aria-hidden>
              →
            </span>
          </Link>
        </div>
      </section>

      {/* Historial — excursiones cerradas */}
      {cerradas.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold" style={{ color: "var(--color-ink-soft)" }}>
            Excursiones anteriores
          </h2>
          <div className="flex flex-col gap-3" style={{ opacity: 0.7 }}>
            {cerradas.map((ex) => {
              const inscritos = inscripcionesDe(ex.id).filter(
                (i) => i.estado === "confirmada"
              ).length;
              return (
                <Link
                  key={ex.id}
                  href={`/coordinador/excursiones/${ex.id}/participantes`}
                  className="card flex items-center gap-4 no-underline"
                  style={{ textDecoration: "none" }}
                >
                  <span className="text-2xl flex-shrink-0" aria-hidden>
                    {ex.imagenEmoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{ex.destino}</p>
                    <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
                      {new Date(ex.fecha + "T12:00:00").toLocaleDateString("es-MX", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}{" "}
                      · {inscritos} asistentes
                    </p>
                  </div>
                  <span
                    className="badge flex-shrink-0"
                    style={{
                      background:
                        ex.estado === "cancelada"
                          ? "var(--color-alert-bg)"
                          : "var(--color-bg-alt)",
                      color:
                        ex.estado === "cancelada"
                          ? "var(--color-alert)"
                          : "var(--color-ink-soft)",
                    }}
                  >
                    {ex.estado === "cancelada" ? "Cancelada" : "Completada"}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
