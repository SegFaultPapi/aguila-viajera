"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { Excursion, Inscripcion } from "@/lib/types";

/* ── Helpers ────────────────────────────────────────────── */

function fechaChip(fecha: string) {
  const d = new Date(fecha + "T12:00:00");
  const dia = d.toLocaleDateString("es-MX", { day: "numeric" });
  const mes = d
    .toLocaleDateString("es-MX", { month: "short" })
    .replace(".", "")
    .toUpperCase();
  return { dia, mes };
}

function formatFechaLarga(fecha: string) {
  return new Date(fecha + "T12:00:00").toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function estadoBadge(inscripcion: Inscripcion) {
  if (inscripcion.estado === "cancelada") {
    return (
      <span
        className="badge"
        style={{
          background: "var(--color-alert-bg)",
          color: "var(--color-alert)",
        }}
      >
        Cancelada
      </span>
    );
  }
  if (inscripcion.estado === "lista_espera") {
    return (
      <span
        className="badge"
        style={{
          background: "var(--color-accent-soft)",
          color: "var(--color-accent-dark)",
        }}
      >
        Lista de espera
      </span>
    );
  }
  return (
    <span
      className="badge"
      style={{
        background: "var(--color-success-bg)",
        color: "var(--color-success)",
      }}
    >
      ✓ Confirmada
    </span>
  );
}

/* ── Tarjeta de reserva ─────────────────────────────────── */

function TarjetaReserva({
  inscripcion,
  excursion,
  paraUsuarioNombre,
  mostrarPara,
  onCancelar,
  onResponderReprogramacion,
}: {
  inscripcion: Inscripcion;
  excursion: Excursion;
  paraUsuarioNombre: string;
  mostrarPara: boolean;
  onCancelar: () => void;
  onResponderReprogramacion: (respuesta: "confirmada" | "rechazada") => void;
}) {
  const router = useRouter();
  const [confirmandoCancelacion, setConfirmandoCancelacion] = useState(false);
  const { dia, mes } = fechaChip(excursion.fecha);

  const href = `/excursiones/${excursion.id}`;
  const esCancelada = inscripcion.estado === "cancelada";
  const esActiva = !esCancelada;
  const necesitaRespuesta =
    excursion.estado === "reprogramada" &&
    inscripcion.respuestaReprogramacion === "pendiente";

  return (
    <div
      className="card flex flex-col gap-3"
      style={{ opacity: esCancelada ? 0.65 : 1 }}
    >
      {/* Alerta de reprogramación pendiente */}
      {necesitaRespuesta && (
        <div
          className="alert-box flex flex-col gap-2"
          role="alert"
        >
          <p className="font-bold text-base">
            ⚠️ La fecha de esta excursión cambió
          </p>
          <p className="text-sm">
            Nueva fecha:{" "}
            <strong>{formatFechaLarga(excursion.nuevaFecha ?? excursion.fecha)}</strong>
          </p>
          {excursion.motivoCambio && (
            <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
              Motivo: {excursion.motivoCambio}
            </p>
          )}
          <p className="text-sm font-semibold">¿Confirmas tu asistencia a la nueva fecha?</p>
          <div className="flex gap-2 mt-1">
            <button
              className="btn-primary flex-1 text-base"
              style={{ minHeight: "44px" }}
              onClick={() => onResponderReprogramacion("confirmada")}
            >
              Sí, confirmo
            </button>
            <button
              className="btn-secondary flex-1 text-base"
              style={{ minHeight: "44px" }}
              onClick={() => onResponderReprogramacion("rechazada")}
            >
              No puedo ir
            </button>
          </div>
        </div>
      )}

      {/* Cuerpo de la tarjeta */}
      <div
        role="button"
        tabIndex={0}
        className="flex gap-4 cursor-pointer"
        onClick={() => router.push(href)}
        onKeyDown={(e) => e.key === "Enter" && router.push(href)}
      >
        {/* Chip de fecha */}
        <div
          className="flex flex-col items-center justify-center flex-shrink-0 rounded-2xl px-3 py-2 text-center"
          style={{
            background: esCancelada
              ? "var(--color-bg-alt)"
              : "var(--color-primary-soft)",
            minWidth: "56px",
          }}
        >
          <span
            className="text-2xl font-extrabold leading-none"
            style={{
              color: esCancelada
                ? "var(--color-ink-soft)"
                : "var(--color-primary)",
            }}
          >
            {dia}
          </span>
          <span
            className="text-sm font-bold uppercase"
            style={{
              color: esCancelada
                ? "var(--color-ink-soft)"
                : "var(--color-primary)",
            }}
          >
            {mes}
          </span>
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col gap-1.5 min-w-0">
          <div className="flex items-start gap-2 min-w-0">
            <span className="text-2xl flex-shrink-0 mt-0.5" aria-hidden>
              {excursion.imagenEmoji}
            </span>
            <h2 className="text-xl font-extrabold leading-tight">
              {excursion.destino}
            </h2>
          </div>

          <p className="text-base" style={{ color: "var(--color-ink-soft)" }}>
            📍 {excursion.colonia} · Sale {excursion.horaSalida}h
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {estadoBadge(inscripcion)}
            {excursion.estado === "reprogramada" && !necesitaRespuesta && (
              <span
                className="badge"
                style={{
                  background: "var(--color-accent-soft)",
                  color: "var(--color-accent-dark)",
                }}
              >
                Fecha cambiada
              </span>
            )}
            {excursion.estado === "cancelada" && (
              <span
                className="badge"
                style={{
                  background: "var(--color-alert-bg)",
                  color: "var(--color-alert)",
                }}
              >
                Excursión cancelada
              </span>
            )}
            {inscripcion.llevaAcompanante && (
              <span
                className="badge"
                style={{
                  background: "var(--color-bg-alt)",
                  color: "var(--color-ink-soft)",
                }}
              >
                Con acompañante
              </span>
            )}
          </div>

          {mostrarPara && (
            <p className="text-sm font-semibold" style={{ color: "var(--color-ink-soft)" }}>
              Reserva de: {paraUsuarioNombre}
            </p>
          )}

          <Link
            href={href}
            className="text-sm font-bold mt-0.5 self-start"
            style={{ color: "var(--color-primary)" }}
            onClick={(e) => e.stopPropagation()}
          >
            Ver detalles →
          </Link>
        </div>
      </div>

      {/* Cancelar */}
      {esActiva && excursion.estado !== "cancelada" && (
        <div className="border-t pt-3" style={{ borderColor: "var(--color-border)" }}>
          {!confirmandoCancelacion ? (
            <button
              className="btn-ghost-light text-base w-full"
              style={{ minHeight: "44px", color: "var(--color-alert)" }}
              onClick={() => setConfirmandoCancelacion(true)}
            >
              Cancelar mi reserva
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-base font-semibold text-center">
                ¿Segura que quieres cancelar tu lugar?
              </p>
              <p className="text-sm text-center" style={{ color: "var(--color-ink-soft)" }}>
                Esta acción no se puede deshacer. Si cambias de opinión tendrás
                que inscribirte de nuevo.
              </p>
              <div className="flex gap-2 mt-1">
                <button
                  className="btn-secondary flex-1 text-base"
                  style={{ minHeight: "44px" }}
                  onClick={() => setConfirmandoCancelacion(false)}
                >
                  No, conservar
                </button>
                <button
                  className="flex-1 rounded-xl text-base font-bold transition-colors"
                  style={{
                    minHeight: "44px",
                    background: "var(--color-alert-bg)",
                    color: "var(--color-alert)",
                    border: "1.5px solid var(--color-alert)",
                  }}
                  onClick={onCancelar}
                >
                  Sí, cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────── */

export default function MisExcursiones() {
  const {
    currentUser,
    inscripciones,
    excursiones,
    usuarios,
    cancelarInscripcion,
    responderReprogramacion,
  } = useStore();
  const { toast } = useToast();

  // Para familiar: también mostrar las inscripciones del adulto que cuidan
  const idsSeguidos: string[] = [currentUser.id];
  if (currentUser.rol === "familiar" && currentUser.cuidaA) {
    idsSeguidos.push(currentUser.cuidaA);
  }

  // Recopilar todas las inscripciones relevantes
  const misInscripciones = inscripciones
    .filter((i) => idsSeguidos.includes(i.usuarioId))
    .map((i) => ({
      inscripcion: i,
      excursion: excursiones.find((e) => e.id === i.excursionId)!,
      paraUsuario: usuarios.find((u) => u.id === i.usuarioId)!,
    }))
    .filter((x) => x.excursion); // descartar huérfanos

  // Separar activas (próximas o en espera) de canceladas/historial
  const activas = misInscripciones
    .filter((x) => x.inscripcion.estado !== "cancelada")
    .sort((a, b) => a.excursion.fecha.localeCompare(b.excursion.fecha));

  const historial = misInscripciones
    .filter((x) => x.inscripcion.estado === "cancelada")
    .sort((a, b) => b.excursion.fecha.localeCompare(a.excursion.fecha));

  const mostrarPara = idsSeguidos.length > 1;

  const saludo =
    currentUser.rol === "familiar"
      ? `Hola, ${currentUser.nombre.split(" ")[0]}`
      : `Hola, ${currentUser.nombre.split(" ")[0]}`;

  return (
    <div className="flex flex-col gap-6">
      {/* Cabecera */}
      <div>
        <p className="text-base font-semibold" style={{ color: "var(--color-ink-soft)" }}>
          {saludo}
        </p>
        <h1 className="text-3xl font-extrabold mt-0.5">Mis reservas</h1>
        {currentUser.rol === "familiar" && currentUser.cuidaA && (
          <p className="text-base mt-1" style={{ color: "var(--color-ink-soft)" }}>
            Incluye las reservas de{" "}
            <strong>
              {usuarios.find((u) => u.id === currentUser.cuidaA)?.nombre ?? "tu familiar"}
            </strong>
            .
          </p>
        )}
      </div>

      {/* Próximas / activas */}
      {activas.length > 0 ? (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold">
            Próximas excursiones
            <span
              className="ml-2 badge"
              style={{
                background: "var(--color-primary-soft)",
                color: "var(--color-primary)",
                fontSize: "0.85rem",
              }}
            >
              {activas.length}
            </span>
          </h2>
          {activas.map(({ inscripcion, excursion, paraUsuario }) => (
            <TarjetaReserva
              key={inscripcion.id}
              inscripcion={inscripcion}
              excursion={excursion}
              paraUsuarioNombre={paraUsuario?.nombre ?? ""}
              mostrarPara={mostrarPara && paraUsuario?.id !== currentUser.id}
              onCancelar={() => {
                cancelarInscripcion(inscripcion.id);
                toast("Reserva cancelada", "info");
              }}
              onResponderReprogramacion={(r) => {
                responderReprogramacion(inscripcion.id, r);
                toast(
                  r === "confirmada"
                    ? "Confirmaste tu asistencia a la nueva fecha"
                    : "Reserva cancelada por reprogramación",
                  r === "confirmada" ? "success" : "info"
                );
              }}
            />
          ))}
        </div>
      ) : (
        <div
          className="card flex flex-col items-center gap-4 py-12 text-center"
          style={{ color: "var(--color-ink-soft)" }}
        >
          <span className="text-5xl" aria-hidden>
            🗺️
          </span>
          <div>
            <p className="text-xl font-bold mb-1">Todavía sin reservas</p>
            <p className="text-base">
              Cuando te inscribas a una excursión, aparecerá aquí.
            </p>
          </div>
          <Link href="/excursiones" className="btn-primary text-base">
            Ver excursiones disponibles →
          </Link>
        </div>
      )}

      {/* Historial — canceladas */}
      {historial.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold" style={{ color: "var(--color-ink-soft)" }}>
            Canceladas
          </h2>
          {historial.map(({ inscripcion, excursion, paraUsuario }) => (
            <TarjetaReserva
              key={inscripcion.id}
              inscripcion={inscripcion}
              excursion={excursion}
              paraUsuarioNombre={paraUsuario?.nombre ?? ""}
              mostrarPara={mostrarPara && paraUsuario?.id !== currentUser.id}
              onCancelar={() => {}}
              onResponderReprogramacion={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}
