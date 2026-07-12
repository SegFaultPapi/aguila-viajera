"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { AccesibilidadBadge } from "@/components/AccesibilidadIcon";

export default function DetalleExcursion() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const {
    excursiones,
    usuarios,
    currentUser,
    perfilDe,
    inscripcionVigente,
    inscribir,
    cancelarInscripcion,
    inscripcionesDe,
  } = useStore();

  const excursion = excursiones.find((e) => e.id === id);
  const [llevaAcompanante, setLlevaAcompanante] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [cancelando, setCancelando] = useState(false);

  // El adulto mayor sobre el que se está inscribiendo: uno mismo, o si eres familiar,
  // el adulto mayor al que cuidas.
  const usuarioObjetivo = useMemo(() => {
    if (currentUser.rol === "familiar" && currentUser.cuidaA) {
      return usuarios.find((u) => u.id === currentUser.cuidaA) ?? currentUser;
    }
    return currentUser;
  }, [currentUser, usuarios]);

  if (!excursion) {
    return (
      <div className="card text-center" style={{ color: "var(--color-ink-soft)" }}>
        Excursión no encontrada.
      </div>
    );
  }

  const coordinador = usuarios.find((u) => u.id === excursion.coordinadorId);
  const perfil = perfilDe(usuarioObjetivo.id);
  const inscripcion = inscripcionVigente(excursion.id, usuarioObjetivo.id);
  const confirmadas = inscripcionesDe(excursion.id).filter((i) => i.estado === "confirmada").length;
  const cupoLleno = confirmadas >= excursion.cupoMaximo;

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
    <div className="flex flex-col gap-5 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          onClick={() => router.push("/excursiones")}
          className="w-fit text-sm font-semibold underline"
          style={{ color: "var(--color-primary)" }}
        >
          ← Volver al listado
        </button>
        {currentUser.rol === "coordinador" && currentUser.id === excursion.coordinadorId && (
          <button
            onClick={() => router.push(`/coordinador/excursiones/${excursion.id}/participantes`)}
            className="w-fit text-sm font-semibold underline"
            style={{ color: "var(--color-primary)" }}
          >
            Ver panel de participantes →
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <span
          className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl text-4xl"
          style={{ background: "var(--color-primary-soft)" }}
          aria-hidden
        >
          {excursion.imagenEmoji}
        </span>
        <div>
          <h1 className="text-3xl font-extrabold">{excursion.destino}</h1>
          <p style={{ color: "var(--color-ink-soft)" }}>
            {formatFecha(excursion.fecha)} · {excursion.horaSalida} – {excursion.horaRegreso}
          </p>
        </div>
      </div>

      <div className="card flex flex-col gap-2">
        <h2 className="text-lg font-bold">Logística</h2>
        <p>📍 Punto de salida: {excursion.puntoSalida}</p>
        <p>🚌 Transporte: {excursion.transporte}</p>
        <p>💵 Costo: {excursion.costo === 0 ? "Gratuito" : `$${excursion.costo} MXN`}</p>
        <p>
          👥 Cupo: {confirmadas}/{excursion.cupoMaximo} inscritos
          {cupoLleno && !inscripcion && " (lleno — entrarías a lista de espera)"}
        </p>
        <p>🧑‍🤝‍🧑 Coordina: {coordinador?.nombre}</p>
      </div>

      <div className="card flex flex-col gap-2">
        <h2 className="text-lg font-bold">Qué necesitas llevar</h2>
        <ul className="list-inside list-disc">
          {excursion.queLlevar.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="card flex flex-col gap-2">
        <h2 className="text-lg font-bold">Accesibilidad de la ruta</h2>
        <AccesibilidadBadge excursion={excursion} />
        <ul className="mt-1 list-inside list-disc text-sm" style={{ color: "var(--color-ink-soft)" }}>
          {excursion.accesibilidad.tieneEscaleras && <li>La ruta tiene escaleras.</li>}
          {excursion.accesibilidad.tienePuentesSinRampa && <li>Hay puentes peatonales sin rampa.</li>}
          {excursion.accesibilidad.terrenoIrregular && <li>Terreno irregular en parte del recorrido.</li>}
          {!excursion.accesibilidad.tieneEscaleras &&
            !excursion.accesibilidad.tienePuentesSinRampa &&
            !excursion.accesibilidad.terrenoIrregular && <li>Sin obstáculos reportados.</li>}
        </ul>
      </div>

      {mostrarAlerta && (
        <div className="alert-box" role="alert">
          ⚠️ Esta ruta tiene obstáculos que pueden dificultar tu traslado
          {perfil ? ` (tu perfil de salud indica movilidad: ${movilidadLabel(perfil.movilidad)})` : ""}.
          {" "}
          {excursion.requiereAcompanante
            ? "Esta excursión requiere que vayas con acompañante."
            : "Te recomendamos ir acompañado(a)."}
        </div>
      )}

      {!inscripcion && (
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={llevaAcompanante}
            onChange={(e) => setLlevaAcompanante(e.target.checked)}
            className="h-5 w-5"
          />
          Voy a ir con un acompañante confirmado
        </label>
      )}

      {inscripcion ? (
        <div className="success-box flex flex-col gap-3">
          <p className="font-bold">
            {inscripcion.estado === "confirmada"
              ? `✅ Inscripción confirmada para ${usuarioObjetivo.nombre}.`
              : `⏳ ${usuarioObjetivo.nombre} está en lista de espera.`}
          </p>
          {!cancelando ? (
            <button className="btn-secondary w-fit" onClick={() => setCancelando(true)}>
              Cancelar inscripción
            </button>
          ) : (
            <div className="flex flex-col gap-2 rounded-lg bg-white p-3">
              <p className="font-normal text-black">
                ¿Seguro que quieres cancelar la inscripción de {usuarioObjetivo.nombre}?
              </p>
              <div className="flex gap-2">
                <button className="btn-primary" onClick={handleCancelar}>
                  Sí, cancelar
                </button>
                <button className="btn-secondary" onClick={() => setCancelando(false)}>
                  No, mantener
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="sticky bottom-4">
          <button className="btn-primary w-full text-lg" onClick={handleInscribir}>
            {cupoLleno ? "Unirme a lista de espera" : `Inscribir a ${usuarioObjetivo.nombre}`}
          </button>
        </div>
      )}

      {confirmando && (
        <div className="info-box">
          📩 Confirmación enviada (simulada) a {usuarioObjetivo.nombre}
          {currentUser.rol === "familiar" ? ` y a ${currentUser.nombre}` : ""}.
        </div>
      )}
    </div>
  );
}

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
