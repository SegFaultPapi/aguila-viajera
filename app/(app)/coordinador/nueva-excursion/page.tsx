"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import { BackButton } from "@/components/BackButton";

const PASOS = ["Datos básicos", "Logística", "Accesibilidad", "Revisión"];
const EMOJIS = ["🏛️", "🌳", "⛪", "🏖️", "🎡", "🏞️", "🎭", "🛍️"];

function Campo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-semibold text-sm">{label}</span>
      {children}
    </label>
  );
}

const inputClase = "rounded-xl border-2 bg-white px-4 py-3 outline-none w-full";
const inputEstilo = { borderColor: "var(--color-border)", minHeight: "52px" };

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

  async function publicar() {
    const nueva = await crearExcursion({
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
      <div className="flex flex-col gap-4">
        <BackButton href="/excursiones" />
        <div className="alert-box">
          Esta pantalla es solo para coordinadores COPACO. Abre la pestaña &quot;Yo&quot; en la
          barra inferior y cambia a &quot;Raúl Gómez (coordinador)&quot; para probar este flujo.
        </div>
      </div>
    );
  }

  if (publicado && excursionCreadaId) {
    return (
      <div className="success-box flex flex-col gap-4">
        <h1 className="text-2xl font-extrabold">Excursión publicada</h1>
        <p className="font-normal">
          &quot;{destino}&quot; ya está guardada a tu nombre. Nadie fuera de COPACO puede
          cambiarla o borrarla.
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
    <div className="flex flex-col gap-5 pb-10">
      <BackButton href="/excursiones" />

      <div>
        <h1 className="text-3xl font-extrabold">Nueva excursión</h1>
        <p className="mt-1" style={{ color: "var(--color-ink-soft)" }}>
          Paso {paso + 1} de {PASOS.length}: {PASOS[paso]}
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1">
        {PASOS.map((p, i) => (
          <div key={p} className="flex flex-1 items-center gap-1">
            <span
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold"
              style={{
                background: i <= paso ? "var(--color-primary)" : "var(--color-bg-alt)",
                color: i <= paso ? "white" : "var(--color-ink-soft)",
                border: i <= paso ? "none" : "1px solid var(--color-border)",
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
          <Campo label="Foto de portada">
            <PlaceholderImage label="Foto de la excursión" aspect="aspect-[16/9]" />
          </Campo>

          <Campo label="Destino">
            <input
              type="text"
              required
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              className={inputClase}
              style={inputEstilo}
              placeholder="Ej. Museo Nacional de Antropología"
            />
          </Campo>

          <Campo label="Fecha">
            <input
              type="date"
              required
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className={inputClase}
              style={inputEstilo}
            />
          </Campo>

          <Campo label="Ícono de la excursión">
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button
                  type="button"
                  key={e}
                  onClick={() => setImagenEmoji(e)}
                  className="rounded-xl border-2 text-2xl flex items-center justify-center"
                  style={{
                    borderColor: imagenEmoji === e ? "var(--color-primary)" : "var(--color-border)",
                    background: imagenEmoji === e ? "var(--color-primary-soft)" : "white",
                    width: "52px",
                    height: "52px",
                  }}
                  aria-label={`Elegir ícono ${e}`}
                  aria-pressed={imagenEmoji === e}
                >
                  {e}
                </button>
              ))}
            </div>
          </Campo>
        </div>
      )}

      {paso === 1 && (
        <div className="card flex flex-col gap-4">
          <Campo label="Punto de salida">
            <input
              type="text"
              required
              value={puntoSalida}
              onChange={(e) => setPuntoSalida(e.target.value)}
              className={inputClase}
              style={inputEstilo}
              placeholder="Ej. Explanada COPACO"
            />
          </Campo>
          <div className="flex gap-3">
            <Campo label="Hora de salida">
              <input
                type="time"
                value={horaSalida}
                onChange={(e) => setHoraSalida(e.target.value)}
                className={inputClase}
                style={inputEstilo}
              />
            </Campo>
            <Campo label="Hora de regreso">
              <input
                type="time"
                value={horaRegreso}
                onChange={(e) => setHoraRegreso(e.target.value)}
                className={inputClase}
                style={inputEstilo}
              />
            </Campo>
          </div>
          <Campo label="Cupo máximo">
            <input
              type="number"
              min={1}
              required
              inputMode="numeric"
              value={cupoMaximo}
              onChange={(e) => setCupoMaximo(Number(e.target.value))}
              className={inputClase}
              style={inputEstilo}
            />
          </Campo>
          <Campo label="Costo (MXN, 0 = gratuito)">
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={costo}
              onChange={(e) => setCosto(Number(e.target.value))}
              className={inputClase}
              style={inputEstilo}
            />
          </Campo>
          <Campo label="Medio de transporte">
            <input
              type="text"
              value={transporte}
              onChange={(e) => setTransporte(e.target.value)}
              className={inputClase}
              style={inputEstilo}
            />
          </Campo>
        </div>
      )}

      {paso === 2 && (
        <div className="card flex flex-col gap-3">
          <p className="text-lg font-bold mb-1">Accesibilidad de la ruta</p>
          {[
            ["La ruta tiene escaleras", tieneEscaleras, setTieneEscaleras],
            ["Hay puentes peatonales sin rampa", tienePuentesSinRampa, setTienePuentesSinRampa],
            ["Terreno irregular en el recorrido", terrenoIrregular, setTerrenoIrregular],
            ["Requiere acompañante obligatorio", requiereAcompanante, setRequiereAcompanante],
          ].map(([texto, valor, setValor]) => (
            <label
              key={texto as string}
              className="flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-colors"
              style={{
                borderColor: valor ? "var(--color-primary)" : "var(--color-border)",
                background: valor ? "var(--color-primary-soft)" : "transparent",
                minHeight: "52px",
              }}
            >
              <input
                type="checkbox"
                checked={valor as boolean}
                onChange={(e) => (setValor as (v: boolean) => void)(e.target.checked)}
                className="h-5 w-5 flex-shrink-0"
              />
              <span className="font-semibold">{texto as string}</span>
            </label>
          ))}
          <Campo label="Qué debe llevar el participante (separado por comas)">
            <textarea
              value={queLlevarTexto}
              onChange={(e) => setQueLlevarTexto(e.target.value)}
              className={inputClase}
              style={{ borderColor: "var(--color-border)" }}
              rows={2}
            />
          </Campo>
        </div>
      )}

      {paso === 3 && (
        <div className="card flex flex-col gap-3">
          <p className="text-lg font-bold">Revisión antes de publicar</p>
          <PlaceholderImage label="Foto de la excursión" aspect="aspect-[16/9]" />
          <div className="flex items-center gap-3">
            <span
              className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl flex-shrink-0"
              style={{ background: "var(--color-primary-soft)" }}
              aria-hidden
            >
              {imagenEmoji}
            </span>
            <div className="min-w-0">
              <p className="font-bold truncate">{destino || "(sin destino)"}</p>
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
            Al publicar, quedará guardada a tu nombre ({currentUser.nombre}) con la fecha de hoy.
            No se podrá borrar.
          </div>
        </div>
      )}

      <div className="flex justify-between gap-3">
        <button className="btn-secondary" onClick={anterior} disabled={paso === 0}>
          ← Atrás
        </button>
        {paso < PASOS.length - 1 ? (
          <button
            className="btn-primary flex-1"
            onClick={siguiente}
            disabled={(paso === 0 && !pasoBasicoValido) || (paso === 1 && !pasoLogisticaValido)}
          >
            Siguiente →
          </button>
        ) : (
          <button className="btn-primary flex-1" onClick={publicar}>
            Publicar excursión
          </button>
        )}
      </div>
    </div>
  );
}
