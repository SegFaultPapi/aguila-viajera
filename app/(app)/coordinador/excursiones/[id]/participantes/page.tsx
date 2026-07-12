"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { AnclajeBlockchain, Movilidad } from "@/lib/types";
import { BackButton } from "@/components/BackButton";
import {
  contenidoCanonicoActa,
  formatearHash,
  hashObjeto,
} from "@/lib/crypto";
import { etherscanTxUrl, RED_ACTIVA } from "@/lib/blockchain/config";
import {
  checkinsDeExcursion,
  marcarSincronizados,
  registrarCheckinLocal,
} from "@/lib/offline-checkin";

const MOVILIDAD_ICONO: Record<Movilidad, string> = {
  independiente: "🚶",
  baston: "🦯",
  andadera: "🚶‍♀️🦯",
  silla_ruedas: "♿",
  no_aplica: "—",
};

export default function PanelParticipantesPage() {
  const { id } = useParams<{ id: string }>();
  const {
    excursiones,
    currentUser,
    inscripcionesDe,
    usuarioById,
    perfilDe,
    marcarAsistencia,
    registrarAnclajeBlockchain,
  } = useStore();
  const [expandido, setExpandido] = useState<string | null>(null);

  // ── Épica C: hash del acta y estado de publicación ────────────────────────
  const [contentHash, setContentHash] = useState<string>("");
  const [publicando, setPublicando] = useState(false);
  const [errorPublicacion, setErrorPublicacion] = useState<string | null>(null);

  // ── Check-in offline-first (PRD §4.6) ─────────────────────────────────────
  const [enLinea, setEnLinea] = useState(true);
  const [pendientesSync, setPendientesSync] = useState<Set<string>>(new Set());

  const excursion = excursiones.find((e) => e.id === id);

  // Al montar: restaurar check-ins guardados localmente (el store en memoria
  // se resetea en cada recarga, pero la cola local no) y detectar conectividad.
  useEffect(() => {
    if (!excursion) return;
    setEnLinea(window.navigator.onLine);

    const guardados = checkinsDeExcursion(excursion.id);
    const pendientes = new Set(guardados.filter((c) => !c.sincronizado).map((c) => c.inscripcionId));
    setPendientesSync(pendientes);
    for (const c of guardados) {
      const insc = inscripcionesDe(excursion.id).find((i) => i.id === c.inscripcionId);
      if (insc && insc.asistenciaConfirmada !== c.asistio) {
        void marcarAsistencia(c.inscripcionId, c.asistio);
      }
    }

    const alVolverEnLinea = () => {
      setEnLinea(true);
      marcarSincronizados(excursion.id);
      setPendientesSync(new Set());
    };
    const alPerderConexion = () => setEnLinea(false);
    window.addEventListener("online", alVolverEnLinea);
    window.addEventListener("offline", alPerderConexion);
    return () => {
      window.removeEventListener("online", alVolverEnLinea);
      window.removeEventListener("offline", alPerderConexion);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [excursion?.id]);

  const handleMarcarAsistencia = (inscripcionId: string, asistio: boolean) => {
    if (!excursion) return;
    void marcarAsistencia(inscripcionId, asistio);
    registrarCheckinLocal(inscripcionId, excursion.id, asistio, enLinea);
    setPendientesSync((prev) => {
      const next = new Set(prev);
      if (enLinea) next.delete(inscripcionId);
      else next.add(inscripcionId);
      return next;
    });
  };

  // Calcular hash del acta — se recalcula cuando cambia la asistencia
  // Usa contenidoCanonicoActa: nombres y datos personales NUNCA tocan la cadena,
  // solo el coordinadorId (firmante institucional), el conteo y una huella de la lista.
  const inscripcionesParaHash = excursion
    ? inscripcionesDe(excursion.id).filter((i) => i.estado !== "cancelada" && i.asistenciaConfirmada)
    : [];

  useEffect(() => {
    if (!excursion) return;
    contenidoCanonicoActa({
      excursionId: excursion.id,
      excursionFecha: excursion.fecha,
      coordinadorId: excursion.coordinadorId,
      idsAsistentes: inscripcionesParaHash.map((i) => i.id),
      actaTimestamp: new Date().toISOString(),
    })
      .then(hashObjeto)
      .then(setContentHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [excursion?.id, inscripcionesParaHash.length]);

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

      {!enLinea && (
        <div className="alert-box text-sm" role="status">
          Sin conexión — los check-ins se guardan en este dispositivo y se sincronizarán
          automáticamente cuando vuelva la señal.
        </div>
      )}

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
                    onChange={(e) => handleMarcarAsistencia(insc.id, e.target.checked)}
                  />
                  Asistió
                </label>
              </div>

              {pendientesSync.has(insc.id) && (
                <span
                  className="badge w-fit"
                  style={{ background: "var(--color-alert-bg)", color: "var(--color-alert)" }}
                >
                  Guardado en el dispositivo · pendiente de sincronizar
                </span>
              )}

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

      {/* ── Épica C: Registro en Blockchain ─────────────────────────────── */}
      <SeccionBlockchain
        excursion={excursion}
        totalAsistentes={asistieron}
        contentHash={contentHash}
        anclajeExistente={excursion.anclajeBlockchain}
        publicando={publicando}
        errorPublicacion={errorPublicacion}
        onPublicar={async (forzarNueva = false) => {
          setPublicando(true);
          setErrorPublicacion(null);
          try {
            const idsAsistentes = inscripcionesParaHash.map((i) => i.id);
            const respuesta = await fetch("/api/blockchain/publicar-acta", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                excursionId: excursion.id,
                destino: excursion.destino,
                colonia: excursion.colonia,
                fecha: excursion.fecha,
                totalAsistentes: idsAsistentes.length,
                cupoMaximo: excursion.cupoMaximo,
                coordinadorId: excursion.coordinadorId,
                idsAsistentes,
                forzarNueva,
              }),
            });
            const datos = await respuesta.json();
            if (!respuesta.ok) {
              throw new Error(datos.error ?? "Error al publicar el acta.");
            }
            registrarAnclajeBlockchain(excursion.id, {
              txHash: datos.txHash,
              actaId: datos.actaId,
              blockNumber: datos.blockNumber,
              ancladoEn: datos.publicadoEn,
              red: RED_ACTIVA === "mainnet" ? "mainnet" : "sepolia",
            });
          } catch (err) {
            setErrorPublicacion(
              err instanceof Error ? err.message : "Error al publicar. Inténtalo de nuevo."
            );
          } finally {
            setPublicando(false);
          }
        }}
      />
    </div>
  );
}

// ── Componente de sección blockchain ─────────────────────────────────────────

interface SeccionBlockchainProps {
  excursion: { destino: string; colonia: string; fecha: string; cupoMaximo: number };
  totalAsistentes: number;
  contentHash: string;
  anclajeExistente?: AnclajeBlockchain;
  publicando: boolean;
  errorPublicacion: string | null;
  onPublicar: (forzarNueva?: boolean) => Promise<void>;
}

function SeccionBlockchain({
  excursion,
  totalAsistentes,
  contentHash,
  anclajeExistente,
  publicando,
  errorPublicacion,
  onPublicar,
}: SeccionBlockchainProps) {
  return (
    <div className="card flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden>⛓️</span>
        <h2 className="text-lg font-bold">Registro en Blockchain</h2>
      </div>

      <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
        Publica el acta de esta excursión en Ethereum para que cualquiera pueda
        verificar públicamente que ocurrió y cuánta gente asistió. Un solo botón —
        no necesitas wallet ni firmar nada, COPACO se encarga de eso por ti.
      </p>

      {/* Vista previa de lo que se publicará — solo datos agregados */}
      <div
        className="rounded-xl p-3 flex flex-col gap-1.5 text-sm"
        style={{ background: "var(--color-bg-alt)" }}
      >
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-ink-soft)" }}>
          Esto es lo que se publicará
        </p>
        <p><strong>Destino:</strong> {excursion.destino}</p>
        <p><strong>Colonia:</strong> {excursion.colonia}</p>
        <p><strong>Asistentes:</strong> {totalAsistentes}/{excursion.cupoMaximo}</p>
        <p className="text-xs" style={{ color: "var(--color-ink-soft)" }}>
          Nunca se suben nombres, teléfonos, datos de salud ni fotografías —
          solo estos datos agregados y una huella de verificación:{" "}
          <span className="font-mono">{contentHash ? formatearHash(contentHash) : "calculando…"}</span>
        </p>
      </div>

      {anclajeExistente ? (
        /* Ya publicada (o TX enviada) */
        <div className="success-box flex flex-col gap-2">
          <p className="font-bold">
            Acta publicada en Ethereum{" "}
            {anclajeExistente.red === "mainnet" ? "(Mainnet)" : "(Sepolia testnet)"}
          </p>
          <div className="flex flex-col gap-1 text-sm">
            <p>
              <strong>TX Hash:</strong>{" "}
              <span className="font-mono">{formatearHash(anclajeExistente.txHash)}</span>
            </p>
            {anclajeExistente.blockNumber > 0 ? (
              <>
                <p><strong>Bloque:</strong> #{anclajeExistente.blockNumber}</p>
                <p>
                  <strong>Publicada el:</strong>{" "}
                  {new Date(anclajeExistente.ancladoEn).toLocaleString("es-MX")}
                </p>
              </>
            ) : (
              <p style={{ color: "var(--color-ink-soft)" }}>
                Transacción enviada — esperando confirmación del bloque en Etherscan.
              </p>
            )}
          </div>
          <a
            href={etherscanTxUrl(anclajeExistente.txHash, anclajeExistente.red)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-center text-sm"
            style={{ display: "block", textDecoration: "none" }}
          >
            Ver en Etherscan →
          </a>

          {/* Republicar si cambiaron los asistentes o se necesita corregir */}
          <div className="border-t pt-3" style={{ borderColor: "var(--color-success-border, #86efac)" }}>
            <p className="text-xs mb-2" style={{ color: "var(--color-ink-soft)" }}>
              ¿Cambió el número de asistentes o necesitas corregir el acta?
            </p>
            {errorPublicacion && (
              <div className="alert-box text-sm mb-2">{errorPublicacion}</div>
            )}
            <button
              className="btn-ghost-light text-sm w-full"
              disabled={!contentHash || publicando}
              onClick={() => { void onPublicar(true); }}
              aria-busy={publicando}
            >
              {publicando ? "Publicando versión actualizada…" : "Publicar versión actualizada"}
            </button>
          </div>
        </div>
      ) : (
        /* Aún no publicada */
        <div className="flex flex-col gap-3">
          {errorPublicacion && (
            <div className="alert-box text-sm">{errorPublicacion}</div>
          )}

          <button
            className="btn-primary"
            disabled={!contentHash || publicando}
            onClick={() => { void onPublicar(); }}
            aria-busy={publicando}
          >
            {publicando ? "Publicando acta…" : "Publicar acta en Ethereum"}
          </button>
        </div>
      )}
    </div>
  );
}
