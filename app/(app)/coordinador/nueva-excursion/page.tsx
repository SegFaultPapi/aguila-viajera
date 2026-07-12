"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";

const PASOS = ["Datos básicos", "Logística y transporte", "Accesibilidad y salud", "Revisión y publicar"];
const EMOJIS = ["🏛️", "🌳", "⛪", "🏖️", "🎡", "🏞️", "🎭", "🛍️"];

export default function NuevaExcursionPage() {
  const router = useRouter();
  const { currentUser, crearExcursion } = useStore();
  const [paso, setPaso] = useState(0);

  const [destino, setDestino] = useState("");
  const [fecha, setFecha] = useState("");
  const [imagenEmoji, setImagenEmoji] = useState(EMOJIS[0]);

  const [horaSalida, setHoraSalida] = useState("08:00");
  const [horaRegreso, setHoraRegreso] = useState("15:00");
  const [puntoSalida, setPuntoSalida] = useState("");
  const [cupoMaximo, setCupoMaximo] = useState(20);
  const [costo, setCosto] = useState(0);
  const [transporte, setTransporte] = useState("Autobús rentado por COPACO");

  const [tieneEscaleras, setTieneEscaleras] = useState(false);
  const [tienePuentesSinRampa, setTienePuentesSinRampa] = useState(false);
  const [terrenoIrregular, setTerrenoIrregular] = useState(false);
  const [requiereAcompanante, setRequiereAcompanante] = useState(false);
  const [queLlevarTexto, setQueLlevarTexto] = useState("Identificación oficial, Medicamentos personales");

  const [publicado, setPublicado] = useState(false);
  const [excursionCreadaId, setExcursionCreadaId] = useState<string | null>(null);

  const pasoBasicoValido = destino.trim() !== "" && fecha !== "";
  const pasoLogisticaValido = puntoSalida.trim() !== "" && cupoMaximo > 0;

  function siguiente() {
    if (paso === 0 && !pasoBasicoValido) return;
    if (paso === 1 && !pasoLogisticaValido) return;
    setPaso((p) => Math.min(p + 1, PASOS.length - 1));
  }

  function anterior() {
    setPaso((p) => Math.max(p - 1, 0));
  }

  function publicar() {
    const nueva = crearExcursion({
      destino,
      colonia: currentUser.colonia,
      fecha,
      horaSalida,
      horaRegreso,
      puntoSalida,
      cupoMaximo,
      costo,
      transporte,
      accesibilidad: { tieneEscaleras, tienePuentesSinRampa, terrenoIrregular },
      requiereAcompanante,
      queLlevar: queLlevarTexto.split(",").map((s) => s.trim()).filter(Boolean),
      coordinadorId: currentUser.id,
      imagenEmoji,
    });
    setExcursionCreadaId(nueva.id);
    setPublicado(true);
  }

  if (currentUser.rol !== "coordinador") {
    return (
      <div className="alert-box">
        Esta pantalla es solo para coordinadores COPACO. Cambia de usuario en la parte superior a
        &quot;Raúl Gómez (coordinador)&quot; para probar este flujo.
      </div>
    );
  }

  if (publicado && excursionCreadaId) {
    return (
      <div className="success-box flex flex-col gap-4">
        <h1 className="text-2xl font-extrabold">✅ Excursión publicada</h1>
        <p className="font-normal">
          &quot;{destino}&quot; quedó registrada con tu autoría (coordinador: {currentUser.nombre}) y
          fecha/hora del servidor — este registro no puede ser editado ni borrado por nadie fuera
          de COPACO.
        </p>
        <div className="flex flex-wrap gap-3">
          <button className="btn-primary" onClick={() => router.push(`/excursiones/${excursionCreadaId}`)}>
            Ver excursión publicada
          </button>
          <button
            className="btn-secondary"
            onClick={() => router.push(`/coordinador/excursiones/${excursionCreadaId}/participantes`)}
          >
            Ir al panel de participantes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-3xl font-extrabold">Nueva excursión</h1>
        <p className="mt-1" style={{ color: "var(--color-ink-soft)" }}>
          Paso {paso + 1} de {PASOS.length}: {PASOS[paso]}
        </p>
      </div>

      <div className="flex items-center gap-1">
        {PASOS.map((p, i) => (
          <div key={p} className="flex flex-1 items-center gap-1">
            <span
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold"
              style={{
                background: i <= paso ? "var(--color-primary)" : "var(--color-bg-alt)",
                color: i <= paso ? "white" : "var(--color-ink-soft)",
                border: i <= paso ? "none" : `1px solid var(--color-border)`,
              }}
            >
              {i < paso ? "✓" : i + 1}
            </span>
            {i < PASOS.length - 1 && (
              <span
                className="h-0.5 flex-1"
                style={{ background: i < paso ? "var(--color-primary)" : "var(--color-border)" }}
              />
            )}
          </div>
        ))}
      </div>

      {paso === 0 && (
        <div className="card flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            Destino
            <input
              type="text"
              required
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              className="rounded-lg border px-3 py-2"
              style={{ borderColor: "var(--color-border)" }}
              placeholder="Ej. Museo Nacional de Antropología"
            />
          </label>
          <label className="flex flex-col gap-1">
            Fecha
            <input
              type="date"
              required
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="rounded-lg border px-3 py-2"
              style={{ borderColor: "var(--color-border)" }}
            />
          </label>
          <div className="flex flex-col gap-1">
            Ícono de la excursión
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button
                  type="button"
                  key={e}
                  onClick={() => setImagenEmoji(e)}
                  className="rounded-lg border px-3 py-2 text-2xl"
                  style={{
                    borderColor: imagenEmoji === e ? "var(--color-primary)" : "var(--color-border)",
                    background: imagenEmoji === e ? "var(--color-primary-soft)" : "white",
                  }}
                  aria-label={`Elegir ícono ${e}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {paso === 1 && (
        <div className="card flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            Punto y hora de salida
            <input
              type="text"
              required
              value={puntoSalida}
              onChange={(e) => setPuntoSalida(e.target.value)}
              className="rounded-lg border px-3 py-2"
              style={{ borderColor: "var(--color-border)" }}
              placeholder="Ej. Explanada COPACO"
            />
          </label>
          <div className="flex gap-3">
            <label className="flex flex-1 flex-col gap-1">
              Hora de salida
              <input
                type="time"
                value={horaSalida}
                onChange={(e) => setHoraSalida(e.target.value)}
                className="rounded-lg border px-3 py-2"
                style={{ borderColor: "var(--color-border)" }}
              />
            </label>
            <label className="flex flex-1 flex-col gap-1">
              Hora de regreso
              <input
                type="time"
                value={horaRegreso}
                onChange={(e) => setHoraRegreso(e.target.value)}
                className="rounded-lg border px-3 py-2"
                style={{ borderColor: "var(--color-border)" }}
              />
            </label>
          </div>
          <label className="flex flex-col gap-1">
            Cupo máximo
            <input
              type="number"
              min={1}
              required
              value={cupoMaximo}
              onChange={(e) => setCupoMaximo(Number(e.target.value))}
              className="rounded-lg border px-3 py-2"
              style={{ borderColor: "var(--color-border)" }}
            />
          </label>
          <label className="flex flex-col gap-1">
            Costo (MXN, 0 = gratuito)
            <input
              type="number"
              min={0}
              value={costo}
              onChange={(e) => setCosto(Number(e.target.value))}
              className="rounded-lg border px-3 py-2"
              style={{ borderColor: "var(--color-border)" }}
            />
          </label>
          <label className="flex flex-col gap-1">
            Medio de transporte
            <input
              type="text"
              value={transporte}
              onChange={(e) => setTransporte(e.target.value)}
              className="rounded-lg border px-3 py-2"
              style={{ borderColor: "var(--color-border)" }}
            />
          </label>
        </div>
      )}

      {paso === 2 && (
        <div className="card flex flex-col gap-4">
          <p className="text-lg font-bold">Accesibilidad de la ruta</p>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={tieneEscaleras} onChange={(e) => setTieneEscaleras(e.target.checked)} className="h-5 w-5" />
            La ruta tiene escaleras
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={tienePuentesSinRampa} onChange={(e) => setTienePuentesSinRampa(e.target.checked)} className="h-5 w-5" />
            Hay puentes peatonales sin rampa
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={terrenoIrregular} onChange={(e) => setTerrenoIrregular(e.target.checked)} className="h-5 w-5" />
            Terreno irregular en el recorrido
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={requiereAcompanante} onChange={(e) => setRequiereAcompanante(e.target.checked)} className="h-5 w-5" />
            Requiere acompañante obligatorio para movilidad reducida
          </label>
          <label className="flex flex-col gap-1">
            Qué debe llevar el participante (separado por comas)
            <textarea
              value={queLlevarTexto}
              onChange={(e) => setQueLlevarTexto(e.target.value)}
              className="rounded-lg border px-3 py-2"
              style={{ borderColor: "var(--color-border)" }}
              rows={2}
            />
          </label>
        </div>
      )}

      {paso === 3 && (
        <div className="card flex flex-col gap-3">
          <p className="text-lg font-bold">Revisión antes de publicar</p>
          <div className="flex items-center gap-3">
            <span
              className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl"
              style={{ background: "var(--color-primary-soft)" }}
              aria-hidden
            >
              {imagenEmoji}
            </span>
            <div>
              <p className="font-bold">{destino || "(sin destino)"}</p>
              <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
                {fecha || "(sin fecha)"}
              </p>
            </div>
          </div>
          <p>Salida: {puntoSalida || "(sin punto)"} a las {horaSalida}, regreso {horaRegreso}</p>
          <p>Cupo: {cupoMaximo} · Costo: {costo === 0 ? "Gratuito" : `$${costo} MXN`} · {transporte}</p>
          <p>
            Accesibilidad: {[
              tieneEscaleras && "escaleras",
              tienePuentesSinRampa && "puentes sin rampa",
              terrenoIrregular && "terreno irregular",
            ].filter(Boolean).join(", ") || "sin obstáculos reportados"}
            {requiereAcompanante && " · requiere acompañante"}
          </p>
          <div className="info-box text-sm">
            Al publicar, esta excursión queda con timestamp y tu autoría (
            {currentUser.nombre}) de forma inmutable.
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button className="btn-secondary" onClick={anterior} disabled={paso === 0}>
          ← Atrás
        </button>
        {paso < PASOS.length - 1 ? (
          <button
            className="btn-primary"
            onClick={siguiente}
            disabled={(paso === 0 && !pasoBasicoValido) || (paso === 1 && !pasoLogisticaValido)}
          >
            Siguiente →
          </button>
        ) : (
          <button className="btn-primary" onClick={publicar}>
            Publicar excursión
          </button>
        )}
      </div>
    </div>
  );
}
