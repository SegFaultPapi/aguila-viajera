"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { AccesibilidadBadge } from "@/components/AccesibilidadIcon";
import { BackButton } from "@/components/BackButton";

/* ── Helpers ────────────────────────────────────────────── */

function formatFecha(fecha: string) {
  const d = new Date(fecha + "T12:00:00");
  return d.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
}

function movilidadLabel(m: string) {
  const map: Record<string, string> = {
    independiente: "independiente",
    baston: "usa bastón",
    andadera: "usa andadera",
    silla_ruedas: "usa silla de ruedas",
    no_aplica: "no aplica",
  };
  return map[m] ?? m;
}

function formatTS(ts: string) {
  return new Date(ts).toLocaleString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ── Fila de info ───────────────────────────────────────── */

function InfoFila({ icono, label, valor }: { icono: string; label: string; valor: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-b-0" style={{ borderColor: "var(--color-border)" }}>
      <span className="text-xl flex-shrink-0 mt-0.5" aria-hidden>{icono}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--color-ink-soft)" }}>
          {label}
        </p>
        <p className="text-base font-semibold mt-0.5">{valor}</p>
      </div>
    </div>
  );
}

/* ── Compañeros de viaje ─────────────────────────────────── */

function CompanerosDeViaje({
  excursionId,
  miUsuarioId,
  inscripcionesDe,
  usuarioById,
}: {
  excursionId: string;
  miUsuarioId: string;
  inscripcionesDe: (id: string) => import("@/lib/types").Inscripcion[];
  usuarioById: (id: string) => import("@/lib/types").Usuario | undefined;
}) {
  const todas = inscripcionesDe(excursionId);
  const confirmadas = todas.filter((i) => i.estado === "confirmada");
  const enEspera = todas.filter((i) => i.estado === "lista_espera");

  const yo = confirmadas.find((i) => i.usuarioId === miUsuarioId);
  const otros = confirmadas.filter((i) => i.usuarioId !== miUsuarioId);

  return (
    <div className="card flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Quiénes van en este viaje</h2>
        <span
          className="badge"
          style={{ background: "var(--color-primary-soft)", color: "var(--color-primary)" }}
        >
          {confirmadas.length} confirmado{confirmadas.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {/* Tarjeta propia */}
        {yo && (
          <div
            className="flex items-center gap-3 rounded-xl px-3 py-2.5"
            style={{ background: "var(--color-primary-soft)" }}
          >
            <span
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white"
              style={{ background: "var(--color-primary)" }}
              aria-hidden
            >
              {(usuarioById(yo.usuarioId)?.nombre ?? "?").charAt(0).toUpperCase()}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base leading-tight">
                {usuarioById(yo.usuarioId)?.nombre ?? "Tú"}
                <span
                  className="ml-2 text-xs font-bold uppercase tracking-wide rounded px-1.5 py-0.5"
                  style={{ background: "var(--color-primary)", color: "white" }}
                >
                  Tú
                </span>
              </p>
              {yo.llevaAcompanante && (
                <p className="text-sm mt-0.5" style={{ color: "var(--color-ink-soft)" }}>
                  Va con acompañante
                </p>
              )}
            </div>
          </div>
        )}

        {/* Otros participantes */}
        {otros.length === 0 && (
          <p className="text-base" style={{ color: "var(--color-ink-soft)" }}>
            Eres el primero en inscribirte. ¡Aníma a tus vecinos a unirse!
          </p>
        )}
        {otros.map((insc) => {
          const u = usuarioById(insc.usuarioId);
          const inicial = (u?.nombre ?? "?").charAt(0).toUpperCase();
          return (
            <div
              key={insc.id}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5"
              style={{ background: "var(--color-bg-alt)" }}
            >
              <span
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-extrabold"
                style={{
                  background: "var(--color-border)",
                  color: "var(--color-ink-soft)",
                }}
                aria-hidden
              >
                {inicial}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base leading-tight">{u?.nombre ?? "Participante"}</p>
                {insc.llevaAcompanante && (
                  <p className="text-sm mt-0.5" style={{ color: "var(--color-ink-soft)" }}>
                    Va con acompañante
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {enEspera.length > 0 && (
        <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
          + {enEspera.length} persona{enEspera.length !== 1 ? "s" : ""} en lista de espera
        </p>
      )}
    </div>
  );
}

/* ── Historial de cambios ────────────────────────────────── */

function HistorialCambios({ historial, usuarioById }: {
  historial: { fecha: string; autorId: string; accion: string; motivo?: string }[];
  usuarioById: (id: string) => { nombre: string } | undefined;
}) {
  if (historial.length === 0) return null;
  return (
    <div className="card flex flex-col gap-3">
      <h2 className="text-lg font-bold">Historial de cambios</h2>
      <div className="flex flex-col gap-3">
        {historial.map((entrada, i) => (
          <div
            key={i}
            className="flex gap-3 items-start"
          >
            <span
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white mt-0.5"
              style={{
                background:
                  entrada.accion.includes("cancelada")
                    ? "var(--color-alert)"
                    : entrada.accion.includes("reprogramada")
                    ? "var(--color-accent-dark)"
                    : "var(--color-primary)",
              }}
              aria-hidden
            >
              {entrada.accion.includes("cancelada") ? "✕" : entrada.accion.includes("reprogramada") ? "↻" : "✓"}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base">{entrada.accion}</p>
              {entrada.motivo && (
                <p className="text-base mt-0.5" style={{ color: "var(--color-ink-soft)" }}>
                  Motivo: {entrada.motivo}
                </p>
              )}
              <p className="text-sm mt-0.5" style={{ color: "var(--color-ink-soft)" }}>
                {formatTS(entrada.fecha)} · {usuarioById(entrada.autorId)?.nombre ?? entrada.autorId}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Sección gestión (coordinador) ──────────────────────── */

type PanelGestion = "cancelar" | "reprogramar" | null;

function SeccionGestion({
  excursionId,
  onCancelar,
  onReprogramar,
}: {
  excursionId: string;
  onCancelar: (motivo: string) => void;
  onReprogramar: (nuevaFecha: string, motivo: string) => void;
}) {
  const [panel, setPanel] = useState<PanelGestion>(null);
  const [motivo, setMotivo] = useState("");
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [error, setError] = useState("");
  const [exito, setExito] = useState<"cancelada" | "reprogramada" | null>(null);

  if (exito === "cancelada") {
    return (
      <div className="alert-box flex flex-col gap-2">
        <p className="font-bold">Excursión cancelada</p>
        <p className="text-base">
          Se ha notificado a todos los inscritos (simulado). El historial de cambios queda registrado abajo.
        </p>
      </div>
    );
  }

  if (exito === "reprogramada") {
    return (
      <div className="success-box flex flex-col gap-2">
        <p className="font-bold">Excursión reprogramada</p>
        <p className="text-base">
          Se ha notificado a todos los inscritos (simulado). Cada participante debe confirmar o declinar la nueva fecha.
        </p>
      </div>
    );
  }

  function handleCancelar() {
    if (!motivo.trim()) { setError("El motivo es obligatorio."); return; }
    onCancelar(motivo.trim());
    setExito("cancelada");
    setPanel(null);
  }

  function handleReprogramar() {
    if (!nuevaFecha) { setError("Selecciona la nueva fecha."); return; }
    if (!motivo.trim()) { setError("El motivo es obligatorio."); return; }
    onReprogramar(nuevaFecha, motivo.trim());
    setExito("reprogramada");
    setPanel(null);
  }

  return (
    <div className="card flex flex-col gap-4">
      <h2 className="text-lg font-bold">Gestionar excursión</h2>

      {panel === null && (
        <div className="flex flex-wrap gap-3">
          <button
            className="btn-secondary"
            style={{ minHeight: "52px" }}
            onClick={() => { setPanel("reprogramar"); setError(""); setMotivo(""); setNuevaFecha(""); }}
          >
            Reprogramar fecha
          </button>
          <button
            className="btn-ghost-light"
            style={{
              minHeight: "52px",
              borderColor: "var(--color-alert)",
              color: "var(--color-alert)",
            }}
            onClick={() => { setPanel("cancelar"); setError(""); setMotivo(""); }}
          >
            Cancelar excursión
          </button>
        </div>
      )}

      {panel === "cancelar" && (
        <div className="flex flex-col gap-4">
          <div
            className="rounded-xl border p-4 flex flex-col gap-1"
            style={{ borderColor: "var(--color-alert)", background: "var(--color-alert-bg)" }}
          >
            <p className="font-bold" style={{ color: "var(--color-alert)" }}>
              Confirmar cancelación
            </p>
            <p className="text-base" style={{ color: "var(--color-alert)" }}>
              Esta acción es irreversible. Todos los inscritos serán notificados con el motivo que escribas.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={`motivo-cancelar-${excursionId}`} className="font-semibold text-base">
              Motivo de cancelación <span style={{ color: "var(--color-alert)" }}>*</span>
            </label>
            <textarea
              id={`motivo-cancelar-${excursionId}`}
              value={motivo}
              onChange={(e) => { setMotivo(e.target.value); setError(""); }}
              placeholder="Ej: Se canceló el autobús por descompostura"
              rows={3}
              style={{
                borderRadius: "var(--radius-md)",
                border: "1.5px solid var(--color-border)",
                padding: "12px",
                fontSize: "1rem",
                fontFamily: "inherit",
                resize: "vertical",
                width: "100%",
                minHeight: "80px",
              }}
            />
          </div>

          {error && <p className="text-base font-semibold" style={{ color: "var(--color-alert)" }}>{error}</p>}

          <div className="flex gap-3">
            <button
              className="btn-primary flex-1"
              style={{ background: "var(--color-alert)", minHeight: "52px" }}
              onClick={handleCancelar}
            >
              Sí, cancelar la excursión
            </button>
            <button className="btn-secondary" style={{ minHeight: "52px" }} onClick={() => setPanel(null)}>
              No, mantener
            </button>
          </div>
        </div>
      )}

      {panel === "reprogramar" && (
        <div className="flex flex-col gap-4">
          <p className="text-base" style={{ color: "var(--color-ink-soft)" }}>
            Se conserva la lista de inscritos. Cada participante recibirá una notificación y podrá confirmar o declinar la nueva fecha.
          </p>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={`nueva-fecha-${excursionId}`} className="font-semibold text-base">
              Nueva fecha <span style={{ color: "var(--color-alert)" }}>*</span>
            </label>
            <input
              id={`nueva-fecha-${excursionId}`}
              type="date"
              value={nuevaFecha}
              onChange={(e) => { setNuevaFecha(e.target.value); setError(""); }}
              style={{
                borderRadius: "var(--radius-md)",
                border: "1.5px solid var(--color-border)",
                padding: "12px",
                fontSize: "1rem",
                fontFamily: "inherit",
                width: "100%",
                minHeight: "52px",
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={`motivo-reprog-${excursionId}`} className="font-semibold text-base">
              Motivo del cambio <span style={{ color: "var(--color-alert)" }}>*</span>
            </label>
            <textarea
              id={`motivo-reprog-${excursionId}`}
              value={motivo}
              onChange={(e) => { setMotivo(e.target.value); setError(""); }}
              placeholder="Ej: Lluvia prevista — cambiamos a la siguiente semana"
              rows={3}
              style={{
                borderRadius: "var(--radius-md)",
                border: "1.5px solid var(--color-border)",
                padding: "12px",
                fontSize: "1rem",
                fontFamily: "inherit",
                resize: "vertical",
                width: "100%",
                minHeight: "80px",
              }}
            />
          </div>

          {error && <p className="text-base font-semibold" style={{ color: "var(--color-alert)" }}>{error}</p>}

          <div className="flex gap-3">
            <button
              className="btn-primary flex-1"
              style={{ minHeight: "52px" }}
              onClick={handleReprogramar}
            >
              Confirmar reprogramación
            </button>
            <button className="btn-secondary" style={{ minHeight: "52px" }} onClick={() => setPanel(null)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────── */

export default function DetalleExcursion() {
  const { id } = useParams<{ id: string }>();
  const {
    excursiones, usuarios, currentUser,
    perfilDe, inscripcionVigente, inscribir,
    cancelarInscripcion, inscripcionesDe,
    cancelarExcursion, reprogramarExcursion, responderReprogramacion,
    usuarioById,
  } = useStore();

  const excursion = excursiones.find((e) => e.id === id);
  const [llevaAcompanante, setLlevaAcompanante] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [cancelando, setCancelando] = useState(false);

  const usuarioObjetivo = useMemo(() => {
    if (currentUser.rol === "familiar" && currentUser.cuidaA) {
      return usuarios.find((u) => u.id === currentUser.cuidaA) ?? currentUser;
    }
    return currentUser;
  }, [currentUser, usuarios]);

  if (!excursion) {
    return (
      <div className="flex flex-col gap-4">
        <BackButton href="/excursiones" />
        <div className="card text-center py-12" style={{ color: "var(--color-ink-soft)" }}>
          <span className="text-4xl" aria-hidden>🔍</span>
          <p className="mt-3 font-semibold">Excursión no encontrada.</p>
        </div>
      </div>
    );
  }

  const esCoordinadorPropietario =
    currentUser.rol === "coordinador" && currentUser.id === excursion.coordinadorId;

  const coordinador = usuarios.find((u) => u.id === excursion.coordinadorId);
  const perfil = perfilDe(usuarioObjetivo.id);
  const inscripcion = inscripcionVigente(excursion.id, usuarioObjetivo.id);
  const confirmadas = inscripcionesDe(excursion.id).filter((i) => i.estado === "confirmada").length;
  const cupoLleno = confirmadas >= excursion.cupoMaximo;
  const pct = Math.min((confirmadas / excursion.cupoMaximo) * 100, 100);

  const excursionActiva = excursion.estado === "publicada" || excursion.estado === "reprogramada";

  const movilidadRiesgo =
    perfil &&
    perfil.movilidad !== "independiente" &&
    perfil.movilidad !== "no_aplica" &&
    (excursion.accesibilidad.tieneEscaleras ||
      excursion.accesibilidad.tienePuentesSinRampa ||
      excursion.accesibilidad.terrenoIrregular);

  const mostrarAlerta = (movilidadRiesgo || excursion.requiereAcompanante) && !inscripcion;

  // B4: si la excursión está reprogramada y el inscrito tiene respuesta pendiente
  const reprogramacionPendiente =
    excursion.estado === "reprogramada" && inscripcion?.respuestaReprogramacion === "pendiente";

  function handleInscribir() {
    inscribir(excursion!.id, usuarioObjetivo.id, llevaAcompanante);
    setConfirmando(true);
  }

  function handleCancelarInscripcion() {
    if (inscripcion) cancelarInscripcion(inscripcion.id);
    setCancelando(false);
  }

  return (
    <div className="flex flex-col gap-4 pb-28">
      {/* Navegación */}
      <div className="flex items-center justify-between">
        <BackButton href="/excursiones" />
        {esCoordinadorPropietario && (
          <Link
            href={`/coordinador/excursiones/${excursion.id}/participantes`}
            className="text-base font-bold"
            style={{ color: "var(--color-primary)" }}
          >
            Panel de participantes →
          </Link>
        )}
      </div>

      {/* Banner de estado (cancelada / reprogramada) */}
      {excursion.estado === "cancelada" && (
        <div
          className="rounded-2xl border p-5 flex flex-col gap-2"
          style={{ borderColor: "var(--color-alert)", background: "var(--color-alert-bg)" }}
          role="alert"
        >
          <p className="text-xl font-extrabold" style={{ color: "var(--color-alert)" }}>
            Excursión cancelada
          </p>
          {excursion.motivoCambio && (
            <p className="text-base" style={{ color: "var(--color-alert)" }}>
              Motivo: {excursion.motivoCambio}
            </p>
          )}
          <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
            Todos los inscritos fueron notificados. Consulta el historial de cambios al final de esta página.
          </p>
        </div>
      )}

      {excursion.estado === "reprogramada" && (
        <div
          className="rounded-2xl border p-5 flex flex-col gap-2"
          style={{ borderColor: "var(--color-accent-dark)", background: "var(--color-accent-soft)" }}
          role="status"
        >
          <p className="text-xl font-extrabold" style={{ color: "var(--color-accent-dark)" }}>
            Excursión reprogramada
          </p>
          <p className="text-base font-semibold" style={{ color: "var(--color-accent-dark)" }}>
            Nueva fecha: {formatFecha(excursion.fecha)}
          </p>
          {excursion.motivoCambio && (
            <p className="text-base" style={{ color: "var(--color-accent-dark)" }}>
              Motivo: {excursion.motivoCambio}
            </p>
          )}
        </div>
      )}

      {/* Foto de portada */}
      <div className="aspect-[16/9] overflow-hidden rounded-2xl">
        <img
          src={`/images/excursiones/${excursion.id}.jpg`}
          alt={excursion.destino}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Hero */}
      <div
        className="rounded-2xl p-5 flex items-center gap-4"
        style={{ background: "var(--color-primary-soft)" }}
      >
        <span
          className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl text-4xl"
          style={{ background: "white" }}
          aria-hidden
        >
          {excursion.imagenEmoji}
        </span>
        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold leading-tight">{excursion.destino}</h1>
          <p className="mt-1 text-base font-semibold" style={{ color: "var(--color-primary)" }}>
            {formatFecha(excursion.fecha)}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <AccesibilidadBadge excursion={excursion} />
            {excursion.costo === 0 && <span className="badge badge-success">Gratuito</span>}
            {excursion.estado === "reprogramada" && (
              <span
                className="badge"
                style={{ background: "var(--color-accent-soft)", color: "var(--color-accent-dark)" }}
              >
                Reprogramada
              </span>
            )}
            {excursion.estado === "cancelada" && (
              <span
                className="badge"
                style={{ background: "var(--color-alert-bg)", color: "var(--color-alert)" }}
              >
                Cancelada
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Cupo — solo si está activa */}
      {excursionActiva && (
        <div className="card flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="font-bold">Cupo disponible</p>
            <span
              className="text-sm font-extrabold"
              style={{ color: cupoLleno ? "var(--color-alert)" : "var(--color-primary)" }}
            >
              {cupoLleno ? "Lleno" : `${excursion.cupoMaximo - confirmadas} lugares`}
            </span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: "var(--color-bg-alt)" }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${pct}%`,
                background: cupoLleno ? "var(--color-alert)" : pct >= 75 ? "var(--color-accent)" : "var(--color-primary)",
                transition: "width 0.4s ease",
              }}
            />
          </div>
          <p className="text-base" style={{ color: "var(--color-ink-soft)" }}>
            {confirmadas} de {excursion.cupoMaximo} inscritos confirmados
          </p>
        </div>
      )}

      {/* Logística */}
      <div className="card">
        <h2 className="font-extrabold text-xl mb-1">Logística</h2>
        <InfoFila icono="📅" label="Fecha" valor={formatFecha(excursion.fecha)} />
        <InfoFila icono="🕗" label="Horario" valor={`Salida ${excursion.horaSalida}h · Regreso ${excursion.horaRegreso}h`} />
        <InfoFila icono="📍" label="Punto de salida" valor={excursion.puntoSalida} />
        <InfoFila icono="🚌" label="Transporte" valor={excursion.transporte} />
        <InfoFila icono="💵" label="Costo" valor={excursion.costo === 0 ? "Gratuito" : `$${excursion.costo} MXN`} />
        <InfoFila icono="🧑‍🤝‍🧑" label="Coordinador" valor={coordinador?.nombre ?? "—"} />
      </div>

      {/* ── B4: Sección gestión para el coordinador ─────────── */}
      {esCoordinadorPropietario && excursionActiva && (
        <SeccionGestion
          excursionId={excursion.id}
          onCancelar={(motivo) => cancelarExcursion(excursion.id, motivo)}
          onReprogramar={(nf, motivo) => reprogramarExcursion(excursion.id, nf, motivo)}
        />
      )}

      {/* Qué llevar */}
      <div className="card">
        <h2 className="font-extrabold text-xl mb-3">Qué necesitas llevar</h2>
        <ul className="flex flex-col gap-2">
          {excursion.queLlevar.map((item) => (
            <li key={item} className="flex items-center gap-2.5">
              <span
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: "var(--color-primary)" }}
                aria-hidden
              >
                ✓
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Accesibilidad */}
      <div className="card">
        <h2 className="font-extrabold text-xl mb-3">Accesibilidad de la ruta</h2>
        <div className="flex flex-col gap-2">
          {[
            { cond: excursion.accesibilidad.tieneEscaleras, texto: "Tiene escaleras", riesgo: true },
            { cond: excursion.accesibilidad.tienePuentesSinRampa, texto: "Hay puentes sin rampa", riesgo: true },
            { cond: excursion.accesibilidad.terrenoIrregular, texto: "Terreno irregular en parte del recorrido", riesgo: true },
            {
              cond: !excursion.accesibilidad.tieneEscaleras && !excursion.accesibilidad.tienePuentesSinRampa && !excursion.accesibilidad.terrenoIrregular,
              texto: "Sin obstáculos reportados",
              riesgo: false,
            },
          ]
            .filter((r) => r.cond)
            .map((r) => (
              <div key={r.texto} className="flex items-center gap-2.5">
                <span className="text-lg flex-shrink-0" aria-hidden>
                  {r.riesgo ? "⚠️" : "✅"}
                </span>
                <span className="text-base">{r.texto}</span>
              </div>
            ))}
        </div>
        {excursion.requiereAcompanante && (
          <div
            className="mt-3 rounded-xl px-3 py-2 text-base font-semibold flex items-center gap-2"
            style={{ background: "var(--color-accent-soft)", color: "var(--color-accent-dark)" }}
          >
            👥 Esta excursión requiere ir con acompañante
          </div>
        )}
      </div>

      {/* Alerta de accesibilidad */}
      {mostrarAlerta && excursionActiva && (
        <div className="alert-box flex gap-3 items-start" role="alert">
          <span className="text-2xl flex-shrink-0">⚠️</span>
          <div>
            <p className="font-bold">Revisa antes de inscribirte</p>
            <p className="text-base mt-0.5">
              {movilidadRiesgo
                ? `Tu perfil indica que ${movilidadLabel(perfil!.movilidad)} — esta ruta tiene obstáculos que pueden dificultar el traslado.`
                : "Esta excursión requiere que vayas acompañado(a)."}
            </p>
          </div>
        </div>
      )}

      {/* ── B4: Respuesta a reprogramación (inscrito con pendiente) ── */}
      {reprogramacionPendiente && (
        <div
          className="rounded-2xl border p-5 flex flex-col gap-4"
          style={{ borderColor: "var(--color-accent-dark)", background: "var(--color-accent-soft)" }}
          role="alert"
        >
          <div>
            <p className="text-lg font-extrabold" style={{ color: "var(--color-accent-dark)" }}>
              Esta excursión fue reprogramada
            </p>
            <p className="text-base mt-1" style={{ color: "var(--color-accent-dark)" }}>
              Nueva fecha: <strong>{formatFecha(excursion.fecha)}</strong>
            </p>
            {excursion.motivoCambio && (
              <p className="text-base mt-0.5" style={{ color: "var(--color-accent-dark)" }}>
                Motivo: {excursion.motivoCambio}
              </p>
            )}
            <p className="text-base mt-2 font-semibold" style={{ color: "var(--color-accent-dark)" }}>
              ¿Podrás asistir en la nueva fecha?
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              className="btn-primary flex-1"
              style={{ minHeight: "52px" }}
              onClick={() => responderReprogramacion(inscripcion!.id, "confirmada")}
            >
              Sí, asistiré
            </button>
            <button
              className="btn-secondary flex-1"
              style={{ minHeight: "52px", borderColor: "var(--color-alert)", color: "var(--color-alert)" }}
              onClick={() => responderReprogramacion(inscripcion!.id, "rechazada")}
            >
              No puedo asistir
            </button>
          </div>
        </div>
      )}

      {/* Respuesta ya dada a reprogramación */}
      {excursion.estado === "reprogramada" && inscripcion && inscripcion.respuestaReprogramacion === "confirmada" && (
        <div className="success-box">
          <p className="font-bold">Confirmaste tu asistencia para la nueva fecha</p>
          <p className="text-base mt-0.5">
            {formatFecha(excursion.fecha)} — Tu lugar sigue reservado.
          </p>
        </div>
      )}

      {/* Inscripción — solo en excursiones activas para no-coordinadores */}
      {excursionActiva && !esCoordinadorPropietario && !inscripcion && (
        <div className="card flex flex-col gap-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={llevaAcompanante}
              onChange={(e) => setLlevaAcompanante(e.target.checked)}
              className="h-6 w-6 flex-shrink-0 rounded"
            />
            <span className="font-medium">Voy a ir con un acompañante confirmado</span>
          </label>
        </div>
      )}

      {/* Estado de inscripción */}
      {excursionActiva && !esCoordinadorPropietario && inscripcion && !reprogramacionPendiente && inscripcion.respuestaReprogramacion !== "confirmada" && (
        <div className="success-box flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">
              {inscripcion.estado === "confirmada" ? "✅" : "⏳"}
            </span>
            <div>
              <p className="font-bold">
                {inscripcion.estado === "confirmada"
                  ? `Inscripción confirmada para ${usuarioObjetivo.nombre}`
                  : `${usuarioObjetivo.nombre} está en lista de espera`}
              </p>
              {confirmando && (
                <p className="text-base mt-0.5">
                  Confirmación enviada (simulada) a {usuarioObjetivo.nombre}
                  {currentUser.rol === "familiar" ? ` y a ${currentUser.nombre}` : ""}.
                </p>
              )}
            </div>
          </div>

          {!cancelando ? (
            <button
              className="btn-secondary w-fit"
              onClick={() => setCancelando(true)}
            >
              Cancelar inscripción
            </button>
          ) : (
            <div
              className="rounded-xl border p-4 flex flex-col gap-3"
              style={{ borderColor: "var(--color-alert)", background: "var(--color-alert-bg)" }}
            >
              <p className="font-semibold" style={{ color: "var(--color-alert)" }}>
                ¿Seguro que quieres cancelar la inscripción de {usuarioObjetivo.nombre}?
              </p>
              <div className="flex gap-2">
                <button
                  className="btn-primary"
                  style={{ background: "var(--color-alert)", minHeight: "52px" }}
                  onClick={handleCancelarInscripcion}
                >
                  Sí, cancelar
                </button>
                <button className="btn-secondary" onClick={() => setCancelando(false)}>
                  No, mantener
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Compañeros de viaje — solo visible para inscritos (no coordinador) */}
      {inscripcion && inscripcion.estado !== "cancelada" && !esCoordinadorPropietario && (
        <CompanerosDeViaje
          excursionId={excursion.id}
          miUsuarioId={usuarioObjetivo.id}
          inscripcionesDe={inscripcionesDe}
          usuarioById={usuarioById}
        />
      )}

      {/* ── B4: Historial de cambios ─────────────────────────── */}
      {(esCoordinadorPropietario || inscripcion) && excursion.historial.length > 0 && (
        <HistorialCambios historial={excursion.historial} usuarioById={usuarioById} />
      )}

      {/* CTA sticky */}
      {excursionActiva && !esCoordinadorPropietario && !inscripcion && (
        <div
          className="sticky bottom-20 rounded-2xl shadow-lg"
          style={{ boxShadow: "var(--shadow-lg)" }}
        >
          <button
            className="btn-primary w-full text-lg"
            onClick={handleInscribir}
            style={{ minHeight: "56px" }}
          >
            {cupoLleno
              ? "Unirme a lista de espera 📋"
              : `Inscribir a ${usuarioObjetivo.nombre} →`}
          </button>
        </div>
      )}
    </div>
  );
}
