"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { AccesibilidadBadge } from "@/components/AccesibilidadIcon";

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

/* ── Fila de info ───────────────────────────────────────── */

function InfoFila({ icono, label, valor }: { icono: string; label: string; valor: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-b-0" style={{ borderColor: "var(--color-border)" }}>
      <span className="text-xl flex-shrink-0 mt-0.5" aria-hidden>{icono}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-ink-soft)" }}>
          {label}
        </p>
        <p className="font-semibold mt-0.5">{valor}</p>
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────── */

export default function DetalleExcursion() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const {
    excursiones, usuarios, currentUser,
    perfilDe, inscripcionVigente, inscribir,
    cancelarInscripcion, inscripcionesDe,
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
        <BackButton />
        <div className="card text-center py-12" style={{ color: "var(--color-ink-soft)" }}>
          <span className="text-4xl" aria-hidden>🔍</span>
          <p className="mt-3 font-semibold">Excursión no encontrada.</p>
        </div>
      </div>
    );
  }

  const coordinador = usuarios.find((u) => u.id === excursion.coordinadorId);
  const perfil = perfilDe(usuarioObjetivo.id);
  const inscripcion = inscripcionVigente(excursion.id, usuarioObjetivo.id);
  const confirmadas = inscripcionesDe(excursion.id).filter((i) => i.estado === "confirmada").length;
  const cupoLleno = confirmadas >= excursion.cupoMaximo;
  const pct = Math.min((confirmadas / excursion.cupoMaximo) * 100, 100);

  const movilidadRiesgo =
    perfil &&
    perfil.movilidad !== "independiente" &&
    perfil.movilidad !== "no_aplica" &&
    (excursion.accesibilidad.tieneEscaleras ||
      excursion.accesibilidad.tienePuentesSinRampa ||
      excursion.accesibilidad.terrenoIrregular);

  const mostrarAlerta = (movilidadRiesgo || excursion.requiereAcompanante) && !inscripcion;

  function handleInscribir() {
    inscribir(excursion!.id, usuarioObjetivo.id, llevaAcompanante);
    setConfirmando(true);
  }

  function handleCancelar() {
    if (inscripcion) cancelarInscripcion(inscripcion.id);
    setCancelando(false);
  }

  return (
    <div className="flex flex-col gap-4 pb-28">
      {/* Navegación */}
      <div className="flex items-center justify-between">
        <BackButton />
        {currentUser.rol === "coordinador" && currentUser.id === excursion.coordinadorId && (
          <Link
            href={`/coordinador/excursiones/${excursion.id}/participantes`}
            className="text-sm font-bold"
            style={{ color: "var(--color-primary)" }}
          >
            Panel de participantes →
          </Link>
        )}
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
          <h1 className="text-2xl font-extrabold leading-tight">{excursion.destino}</h1>
          <p className="mt-1 text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
            {formatFecha(excursion.fecha)}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <AccesibilidadBadge excursion={excursion} />
            {excursion.costo === 0 && <span className="badge badge-success">Gratuito</span>}
          </div>
        </div>
      </div>

      {/* Cupo */}
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
        <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
          {confirmadas} de {excursion.cupoMaximo} inscritos confirmados
        </p>
      </div>

      {/* Logística */}
      <div className="card">
        <h2 className="font-extrabold text-lg mb-1">Logística</h2>
        <InfoFila icono="📅" label="Fecha" valor={formatFecha(excursion.fecha)} />
        <InfoFila icono="🕗" label="Horario" valor={`Salida ${excursion.horaSalida}h · Regreso ${excursion.horaRegreso}h`} />
        <InfoFila icono="📍" label="Punto de salida" valor={excursion.puntoSalida} />
        <InfoFila icono="🚌" label="Transporte" valor={excursion.transporte} />
        <InfoFila icono="💵" label="Costo" valor={excursion.costo === 0 ? "Gratuito" : `$${excursion.costo} MXN`} />
        <InfoFila icono="🧑‍🤝‍🧑" label="Coordinador" valor={coordinador?.nombre ?? "—"} />
      </div>

      {/* Qué llevar */}
      <div className="card">
        <h2 className="font-extrabold text-lg mb-3">Qué necesitas llevar</h2>
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
        <h2 className="font-extrabold text-lg mb-3">Accesibilidad de la ruta</h2>
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
                <span className="text-sm">{r.texto}</span>
              </div>
            ))}
        </div>
        {excursion.requiereAcompanante && (
          <div
            className="mt-3 rounded-xl px-3 py-2 text-sm font-semibold flex items-center gap-2"
            style={{ background: "var(--color-accent-soft)", color: "var(--color-accent-dark)" }}
          >
            👥 Esta excursión requiere ir con acompañante
          </div>
        )}
      </div>

      {/* Alerta de accesibilidad */}
      {mostrarAlerta && (
        <div className="alert-box flex gap-3 items-start" role="alert">
          <span className="text-2xl flex-shrink-0">⚠️</span>
          <div>
            <p className="font-bold">Revisa antes de inscribirte</p>
            <p className="text-sm mt-0.5">
              {movilidadRiesgo
                ? `Tu perfil indica que ${movilidadLabel(perfil!.movilidad)} — esta ruta tiene obstáculos que pueden dificultar el traslado.`
                : "Esta excursión requiere que vayas acompañado(a)."}
            </p>
          </div>
        </div>
      )}

      {/* Inscripción */}
      {!inscripcion && (
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
      {inscripcion && (
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
                <p className="text-sm mt-0.5">
                  Confirmación enviada (simulada) a {usuarioObjetivo.nombre}
                  {currentUser.rol === "familiar" ? ` y a ${currentUser.nombre}` : ""}.
                </p>
              )}
            </div>
          </div>

          {!cancelando ? (
            <button
              className="btn-secondary w-fit text-sm"
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
                  className="btn-primary text-sm"
                  style={{ background: "var(--color-alert)", minHeight: "44px" }}
                  onClick={handleCancelar}
                >
                  Sí, cancelar
                </button>
                <button className="btn-secondary text-sm" onClick={() => setCancelando(false)}>
                  No, mantener
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CTA sticky */}
      {!inscripcion && (
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

/* ── Botón de regreso ───────────────────────────────────── */

function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push("/excursiones")}
      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors"
      style={{
        background: "var(--color-bg-alt)",
        color: "var(--color-ink-soft)",
        minHeight: "36px",
      }}
    >
      ← Volver
    </button>
  );
}
