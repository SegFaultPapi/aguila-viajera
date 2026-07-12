"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { AccesibilidadBadge } from "@/components/AccesibilidadIcon";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import { Excursion } from "@/lib/types";

/* ── Banner: perfil de salud incompleto ─────────────────── */

function BannerPerfilIncompleto({
  nombreObjetivo,
  esFamiliar,
}: {
  nombreObjetivo: string;
  esFamiliar: boolean;
}) {
  const [cerrado, setCerrado] = useState(false);
  if (cerrado) return null;

  return (
    <div
      className="info-box flex items-start gap-3"
      role="region"
      aria-label="Aviso de perfil de salud incompleto"
    >
      <span className="text-2xl flex-shrink-0 mt-0.5" aria-hidden>
        🩺
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-base">
          {esFamiliar
            ? `Completa el perfil de salud de ${nombreObjetivo}`
            : "Completa tu perfil de salud"}
        </p>
        <p className="text-base mt-0.5">
          {esFamiliar
            ? `El coordinador necesita conocer las necesidades de ${nombreObjetivo} para preparar cada excursión con seguridad.`
            : "El coordinador necesita conocer tus necesidades para preparar cada excursión con seguridad."}
        </p>
        <Link
          href="/perfil-salud"
          className="btn-primary mt-3 inline-block text-base"
          style={{ minHeight: "44px", lineHeight: "44px", padding: "0 1.25rem" }}
        >
          Completar ahora →
        </Link>
      </div>
      <button
        onClick={() => setCerrado(true)}
        aria-label="Cerrar aviso"
        className="flex-shrink-0 text-2xl leading-none transition-opacity hover:opacity-60 mt-0.5"
        style={{ color: "var(--color-primary)" }}
      >
        ×
      </button>
    </div>
  );
}

/* ── Helpers ────────────────────────────────────────────── */

function fechaChip(fecha: string) {
  const d = new Date(fecha + "T12:00:00");
  const dia = d.toLocaleDateString("es-MX", { day: "numeric" });
  const mes = d.toLocaleDateString("es-MX", { month: "short" }).replace(".", "").toUpperCase();
  return { dia, mes };
}

/* ── Thumbnail de excursión ─────────────────────────────── */

const RADIUS_TOP = "1.25rem 1.25rem 0 0";

function ExcursionThumbnail({ id, emoji }: { id: string; emoji: string }) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div style={{ borderRadius: RADIUS_TOP, overflow: "hidden" }}>
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
      style={{
        width: "100%",
        aspectRatio: "3 / 2",
        objectFit: "cover",
        borderRadius: RADIUS_TOP,
        display: "block",
      }}
    />
  );
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
      className="card card-interactive cursor-pointer overflow-hidden"
      style={{ padding: 0, textDecoration: "none" }}
    >
      {/* Thumbnail */}
      <ExcursionThumbnail id={excursion.id} emoji={excursion.imagenEmoji} />

      {/* Contenido */}
      <div className="flex gap-4 p-5">
        {/* Chip de fecha */}
        <div
          className="flex flex-col items-center justify-center flex-shrink-0 rounded-2xl px-3 py-2 text-center self-start"
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

        {/* Info */}
        <div className="flex flex-1 flex-col gap-2 min-w-0">
          <h2 className="text-xl font-extrabold leading-tight">{excursion.destino}</h2>

          <p className="text-base" style={{ color: "var(--color-ink-soft)" }}>
            📍 {excursion.colonia} · {excursion.horaSalida}h
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium" style={{ color: "var(--color-ink-soft)" }}>
              {cupoLleno
                ? "Cupo lleno"
                : pocosLugares
                ? `${excursion.cupoMaximo - inscritosConfirmados} lugares disponibles`
                : `${inscritosConfirmados}/${excursion.cupoMaximo} inscritos`}
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
            {excursion.estado === "reprogramada" && (
              <span className="badge" style={{ background: "var(--color-accent-soft)", color: "var(--color-accent-dark)" }}>
                Fecha cambiada
              </span>
            )}
            {excursion.estado === "cancelada" && (
              <span className="badge" style={{ background: "var(--color-alert-bg)", color: "var(--color-alert)" }}>
                Cancelada
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
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────── */

export default function ListadoExcursiones() {
  const { excursiones, usuarios, currentUser, inscripcionesDe, perfilDe } = useStore();

  const colonias = useMemo(
    () => Array.from(new Set(excursiones.map((e) => e.colonia))),
    [excursiones]
  );
  const [colonia, setColonia] = useState("todas");

  // Excursiones activas visibles para todos (publicadas + reprogramadas)
  const visibles = excursiones
    .filter((e) => e.estado === "publicada" || e.estado === "reprogramada")
    .filter((e) => colonia === "todas" || e.colonia === colonia)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  // Para coordinadores: sus excursiones canceladas/completadas (no aparecen en el listado general)
  const misExcursionesCerradas = excursiones.filter(
    (e) =>
      currentUser.rol === "coordinador" &&
      e.coordinadorId === currentUser.id &&
      (e.estado === "cancelada" || e.estado === "completada")
  );

  // Banner de perfil incompleto — solo para adulto_mayor y familiar
  const esFamiliar = currentUser.rol === "familiar";
  const idObjetivo =
    esFamiliar && currentUser.cuidaA ? currentUser.cuidaA : currentUser.id;
  const nombreObjetivo =
    esFamiliar && currentUser.cuidaA
      ? (usuarios.find((u) => u.id === currentUser.cuidaA)?.nombre ?? "tu familiar")
      : currentUser.nombre;
  const perfilFaltante =
    currentUser.rol !== "coordinador" && !perfilDe(idObjetivo);

  return (
    <div className="flex flex-col gap-5">
      {/* Banner: perfil de salud incompleto */}
      {perfilFaltante && (
        <BannerPerfilIncompleto
          nombreObjetivo={nombreObjetivo}
          esFamiliar={esFamiliar}
        />
      )}

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

      {/* Historial de coordinador — excursiones canceladas / completadas */}
      {misExcursionesCerradas.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-bold">Excursiones anteriores</h2>
          <p className="text-base" style={{ color: "var(--color-ink-soft)" }}>
            Excursiones que ya no aparecen en el listado principal.
          </p>
          {misExcursionesCerradas.map((ex) => {
            const inscritos = inscripcionesDe(ex.id).filter((i) => i.estado === "confirmada").length;
            const esCoord = currentUser.rol === "coordinador" && currentUser.id === ex.coordinadorId;
            return (
              <div key={ex.id} style={{ opacity: 0.8 }}>
                <ExcursionCard
                  excursion={ex}
                  coordinadorNombre={usuarios.find((u) => u.id === ex.coordinadorId)?.nombre ?? "—"}
                  inscritosConfirmados={inscritos}
                  esCoordinador={esCoord}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
