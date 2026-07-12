"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Movilidad } from "@/lib/types";
import { BackButton } from "@/components/BackButton";

const MOVILIDAD_ICONO: Record<Movilidad, string> = {
  independiente: "🚶",
  baston: "🦯",
  andadera: "🚶‍♀️🦯",
  silla_ruedas: "♿",
  no_aplica: "—",
};

export default function PanelParticipantesPage() {
  const { id } = useParams<{ id: string }>();
  const { excursiones, currentUser, inscripcionesDe, usuarioById, perfilDe, marcarAsistencia } =
    useStore();
  const [expandido, setExpandido] = useState<string | null>(null);

  const excursion = excursiones.find((e) => e.id === id);

  if (!excursion) {
    return (
      <div className="flex flex-col gap-4">
        <BackButton href="/excursiones" />
        <div className="card text-center py-12" style={{ color: "var(--color-ink-soft)" }}>
          Excursión no encontrada.
        </div>
      </div>
    );
  }

  if (currentUser.rol !== "coordinador" || currentUser.id !== excursion.coordinadorId) {
    return (
      <div className="flex flex-col gap-4">
        <BackButton href="/excursiones" />
        <div className="alert-box">
          Solo el coordinador de esta excursión puede ver el panel de participantes. Abre la
          pestaña &quot;Yo&quot; en la barra inferior y cambia a &quot;Raúl Gómez (coordinador)&quot;
          para probar este flujo.
        </div>
      </div>
    );
  }

  const inscripciones = inscripcionesDe(excursion.id).filter((i) => i.estado !== "cancelada");
  const confirmadas = inscripciones.filter((i) => i.estado === "confirmada");
  const enEspera = inscripciones.filter((i) => i.estado === "lista_espera");
  const asistieron = confirmadas.filter((i) => i.asistenciaConfirmada).length;

  return (
    <div className="flex flex-col gap-5 pb-10">
      <BackButton href={`/excursiones/${excursion.id}`} label="Volver a la excursión" />

      <div>
        <div className="flex items-center gap-3">
          <span
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-2xl"
            style={{ background: "var(--color-primary-soft)" }}
            aria-hidden
          >
            {excursion.imagenEmoji}
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold leading-tight truncate">{excursion.destino}</h1>
            <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
              Panel de participantes
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="badge badge-success">{confirmadas.length}/{excursion.cupoMaximo} confirmados</span>
          {enEspera.length > 0 && <span className="badge">{enEspera.length} en lista de espera</span>}
          <span className="badge">Asistencia: {asistieron}/{confirmadas.length}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Confirmados</h2>
        {confirmadas.length === 0 && (
          <div className="card text-center" style={{ color: "var(--color-ink-soft)" }}>
            Nadie inscrito todavía.
          </div>
        )}
        {confirmadas.map((insc) => {
          const usuario = usuarioById(insc.usuarioId);
          const perfil = perfilDe(insc.usuarioId);
          const abierto = expandido === insc.id;
          return (
            <div key={insc.id} className="card flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-xl"
                  style={{ background: "var(--color-primary-soft)" }}
                  aria-hidden
                >
                  {perfil ? MOVILIDAD_ICONO[perfil.movilidad] : "❓"}
                </span>
                <span className="flex-1 min-w-0 text-lg font-bold truncate">{usuario?.nombre ?? "—"}</span>
                <label className="flex items-center gap-2 text-sm font-semibold flex-shrink-0">
                  <input
                    type="checkbox"
                    className="h-6 w-6"
                    checked={insc.asistenciaConfirmada}
                    onChange={(e) => marcarAsistencia(insc.id, e.target.checked)}
                  />
                  Asistió
                </label>
              </div>

              {(insc.llevaAcompanante || (perfil?.acompananteRequerido && !insc.llevaAcompanante)) && (
                <div className="flex flex-wrap gap-2">
                  {insc.llevaAcompanante && <span className="badge">Con acompañante</span>}
                  {perfil?.acompananteRequerido && !insc.llevaAcompanante && (
                    <span className="badge" style={{ background: "var(--color-alert-bg)", color: "var(--color-alert)" }}>
                      Requiere acompañante — no confirmado
                    </span>
                  )}
                </div>
              )}

              <button
                className="w-fit text-sm font-semibold underline"
                style={{ color: "var(--color-primary)" }}
                onClick={() => setExpandido(abierto ? null : insc.id)}
              >
                {abierto ? "Ocultar detalle médico" : "Ver detalle médico"}
              </button>

              {abierto && (
                <div className="flex flex-col gap-1.5 rounded-xl p-3 text-sm" style={{ background: "var(--color-bg-alt)" }}>
                  {perfil ? (
                    <>
                      <p>
                        <strong>Movilidad:</strong> {perfil.movilidad}
                      </p>
                      <p>
                        <strong>Condiciones:</strong>{" "}
                        {[...perfil.condiciones, perfil.condicionLibre].filter(Boolean).join(", ") ||
                          "Ninguna reportada"}
                      </p>
                      <p>
                        <strong>Medicamentos:</strong>{" "}
                        {perfil.medicamentos.length
                          ? perfil.medicamentos.map((m) => `${m.nombre} (${m.horario})`).join(", ")
                          : "Ninguno reportado"}
                      </p>
                      <p>
                        <strong>Contacto de emergencia:</strong> {perfil.contactoEmergencia.nombre} —{" "}
                        {perfil.contactoEmergencia.telefono} ({perfil.contactoEmergencia.relacion})
                      </p>
                    </>
                  ) : (
                    <p className="font-semibold" style={{ color: "var(--color-alert)" }}>
                      Este participante no tiene perfil de salud registrado todavía.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {enEspera.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-bold">Lista de espera</h2>
          {enEspera.map((insc) => (
            <div key={insc.id} className="card font-semibold">
              {usuarioById(insc.usuarioId)?.nombre}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
