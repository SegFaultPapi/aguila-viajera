"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { Medicamento, Movilidad } from "@/lib/types";
import { PlaceholderImage } from "@/components/PlaceholderImage";

const CONDICIONES_COMUNES = ["Diabetes", "Hipertensión", "Demencia senil", "Cardiopatía"];

const MOVILIDAD_OPCIONES: [Movilidad, string, string][] = [
  ["independiente", "🚶", "Independiente"],
  ["baston", "🦯", "Usa bastón"],
  ["andadera", "🚶‍♀️🦯", "Usa andadera"],
  ["silla_ruedas", "♿", "Usa silla de ruedas"],
  ["no_aplica", "—", "No aplica"],
];

/* ── Card de sección ────────────────────────────────────── */

function SeccionCard({
  titulo,
  icono,
  children,
}: {
  titulo: string;
  icono: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col gap-4">
      <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: "var(--color-border)" }}>
        <span className="text-xl" aria-hidden>{icono}</span>
        <h2 className="text-lg font-extrabold">{titulo}</h2>
      </div>
      {children}
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────── */

export default function PerfilSaludPage() {
  const { currentUser, usuarios, perfilDe, guardarPerfilSalud } = useStore();

  const usuarioObjetivo = useMemo(() => {
    if (currentUser.rol === "familiar" && currentUser.cuidaA) {
      return usuarios.find((u) => u.id === currentUser.cuidaA) ?? currentUser;
    }
    return currentUser;
  }, [currentUser, usuarios]);

  const perfilExistente = perfilDe(usuarioObjetivo.id);

  const [movilidad, setMovilidad] = useState<Movilidad>(perfilExistente?.movilidad ?? "independiente");
  const [condiciones, setCondiciones] = useState<string[]>(perfilExistente?.condiciones ?? []);
  const [condicionLibre, setCondicionLibre] = useState(perfilExistente?.condicionLibre ?? "");
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>(perfilExistente?.medicamentos ?? []);
  const [acompananteRequerido, setAcompananteRequerido] = useState(perfilExistente?.acompananteRequerido ?? false);
  const [contactoNombre, setContactoNombre] = useState(perfilExistente?.contactoEmergencia.nombre ?? "");
  const [contactoTelefono, setContactoTelefono] = useState(perfilExistente?.contactoEmergencia.telefono ?? "");
  const [contactoRelacion, setContactoRelacion] = useState(perfilExistente?.contactoEmergencia.relacion ?? "");
  const [guardado, setGuardado] = useState(false);
  const [cargando, setCargando] = useState(false);

  function toggleCondicion(c: string) {
    setCondiciones((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }

  function agregarMedicamento() {
    setMedicamentos((prev) => [...prev, { nombre: "", horario: "" }]);
  }

  function actualizarMedicamento(idx: number, campo: keyof Medicamento, valor: string) {
    setMedicamentos((prev) => prev.map((m, i) => (i === idx ? { ...m, [campo]: valor } : m)));
  }

  function eliminarMedicamento(idx: number) {
    setMedicamentos((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    guardarPerfilSalud({
      usuarioId: usuarioObjetivo.id,
      movilidad,
      condiciones,
      condicionLibre,
      medicamentos: medicamentos.filter((m) => m.nombre.trim() !== ""),
      acompananteRequerido,
      contactoEmergencia: {
        nombre: contactoNombre,
        telefono: contactoTelefono,
        relacion: contactoRelacion,
      },
      actualizadoPorId: currentUser.id,
    });
    setTimeout(() => {
      setCargando(false);
      setGuardado(true);
      setTimeout(() => setGuardado(false), 3000);
    }, 600);
  }

  return (
    <form onSubmit={handleGuardar} className="flex flex-col gap-5 pb-32">
      {/* Cabecera */}
      <div className="flex items-center gap-4">
        <PlaceholderImage
          label="Foto"
          aspect="aspect-square"
          shape="circle"
          className="w-16 flex-shrink-0"
        />
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold">Perfil de salud</h1>
          <p className="mt-0.5 font-semibold truncate" style={{ color: "var(--color-primary)" }}>
            {usuarioObjetivo.nombre}
          </p>
          {currentUser.rol === "familiar" && (
            <p className="mt-0.5 text-sm" style={{ color: "var(--color-ink-soft)" }}>
              Editando como familiar vinculado.
            </p>
          )}
          {perfilExistente && (
            <p className="mt-1 text-sm" style={{ color: "var(--color-ink-soft)" }}>
              Actualizado: {formatFecha(perfilExistente.actualizadoEn)} ·{" "}
              {usuarios.find((u) => u.id === perfilExistente.actualizadoPorId)?.nombre ?? "—"}
            </p>
          )}
        </div>
      </div>

      {/* Aviso de privacidad */}
      <div className="info-box flex gap-2 items-start text-sm">
        <span className="text-xl flex-shrink-0" aria-hidden>🔒</span>
        <span>
          Solo lo pueden ver: <strong>{usuarioObjetivo.nombre}</strong>, sus familiares vinculados,
          y el coordinador de la excursión a la que se inscriba.
        </span>
      </div>

      {/* Movilidad */}
      <SeccionCard titulo="Movilidad" icono="🦽">
        <div className="flex flex-col gap-2">
          {MOVILIDAD_OPCIONES.map(([valor, emoji, label]) => (
            <label
              key={valor}
              className="flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-colors"
              style={{
                borderColor: movilidad === valor ? "var(--color-primary)" : "var(--color-border)",
                background: movilidad === valor ? "var(--color-primary-soft)" : "transparent",
                minHeight: "52px",
              }}
            >
              <input
                type="radio"
                name="movilidad"
                value={valor}
                checked={movilidad === valor}
                onChange={() => setMovilidad(valor)}
                className="h-5 w-5 flex-shrink-0"
              />
              <span className="text-xl flex-shrink-0" aria-hidden>{emoji}</span>
              <span className="font-semibold">{label}</span>
            </label>
          ))}
        </div>
      </SeccionCard>

      {/* Condiciones */}
      <SeccionCard titulo="Condiciones de salud" icono="🩺">
        <div className="flex flex-col gap-2">
          {CONDICIONES_COMUNES.map((c) => (
            <label
              key={c}
              className="flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-colors"
              style={{
                borderColor: condiciones.includes(c) ? "var(--color-primary)" : "var(--color-border)",
                background: condiciones.includes(c) ? "var(--color-primary-soft)" : "transparent",
                minHeight: "52px",
              }}
            >
              <input
                type="checkbox"
                checked={condiciones.includes(c)}
                onChange={() => toggleCondicion(c)}
                className="h-5 w-5 flex-shrink-0"
              />
              <span className="font-semibold">{c}</span>
            </label>
          ))}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="condicion-libre" className="font-semibold text-sm">
            Otra condición (opcional)
          </label>
          <input
            id="condicion-libre"
            type="text"
            value={condicionLibre}
            onChange={(e) => setCondicionLibre(e.target.value)}
            placeholder="Escribe aquí…"
            className="rounded-xl border-2 bg-white px-4 py-3 outline-none"
            style={{ borderColor: "var(--color-border)", minHeight: "52px" }}
          />
        </div>

        <label
          className="flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-colors"
          style={{
            borderColor: acompananteRequerido ? "var(--color-accent)" : "var(--color-border)",
            background: acompananteRequerido ? "var(--color-accent-soft)" : "transparent",
            minHeight: "52px",
          }}
        >
          <input
            type="checkbox"
            checked={acompananteRequerido}
            onChange={(e) => setAcompananteRequerido(e.target.checked)}
            className="h-5 w-5 flex-shrink-0"
          />
          <span className="font-semibold">Requiere acompañante en excursiones</span>
        </label>
      </SeccionCard>

      {/* Medicamentos */}
      <SeccionCard titulo="Medicamentos críticos" icono="💊">
        {medicamentos.length === 0 && (
          <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
            Ningún medicamento registrado.
          </p>
        )}
        {medicamentos.map((m, idx) => (
          <div key={idx} className="rounded-xl border p-3 flex flex-col gap-2" style={{ borderColor: "var(--color-border)" }}>
            <input
              type="text"
              placeholder="Nombre del medicamento"
              value={m.nombre}
              onChange={(e) => actualizarMedicamento(idx, "nombre", e.target.value)}
              className="rounded-lg border px-3 py-2.5 outline-none w-full"
              style={{ borderColor: "var(--color-border)", minHeight: "48px" }}
            />
            <input
              type="text"
              placeholder="Horario (ej. 8am y 8pm)"
              value={m.horario}
              onChange={(e) => actualizarMedicamento(idx, "horario", e.target.value)}
              className="rounded-lg border px-3 py-2.5 outline-none w-full"
              style={{ borderColor: "var(--color-border)", minHeight: "48px" }}
            />
            <button
              type="button"
              className="btn-secondary text-sm self-start"
              style={{ minHeight: "40px" }}
              onClick={() => eliminarMedicamento(idx)}
            >
              Quitar medicamento
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn-secondary w-full"
          onClick={agregarMedicamento}
        >
          + Agregar medicamento
        </button>
      </SeccionCard>

      {/* Contacto de emergencia */}
      <SeccionCard titulo="Contacto de emergencia" icono="📞">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="contacto-nombre" className="font-semibold text-sm">Nombre</label>
            <input
              id="contacto-nombre"
              type="text"
              required
              value={contactoNombre}
              onChange={(e) => setContactoNombre(e.target.value)}
              className="rounded-xl border-2 bg-white px-4 py-3 outline-none"
              style={{ borderColor: "var(--color-border)", minHeight: "52px" }}
              placeholder="Nombre completo"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="contacto-tel" className="font-semibold text-sm">Teléfono</label>
            <input
              id="contacto-tel"
              type="tel"
              required
              inputMode="numeric"
              value={contactoTelefono}
              onChange={(e) => setContactoTelefono(e.target.value)}
              className="rounded-xl border-2 bg-white px-4 py-3 outline-none"
              style={{ borderColor: "var(--color-border)", minHeight: "52px" }}
              placeholder="55 1234 5678"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="contacto-relacion" className="font-semibold text-sm">Relación</label>
            <input
              id="contacto-relacion"
              type="text"
              required
              value={contactoRelacion}
              onChange={(e) => setContactoRelacion(e.target.value)}
              className="rounded-xl border-2 bg-white px-4 py-3 outline-none"
              style={{ borderColor: "var(--color-border)", minHeight: "52px" }}
              placeholder="Ej. Hija, esposo, vecina"
            />
          </div>
        </div>
      </SeccionCard>

      {/* Botón guardar sticky */}
      <div
        className="sticky bottom-20 flex flex-col gap-2"
        style={{ filter: "drop-shadow(0 -4px 12px rgba(0,0,0,0.08))" }}
      >
        {guardado && (
          <div className="success-box flex items-center gap-2 text-sm">
            <span>✅</span> Perfil guardado correctamente.
          </div>
        )}
        <button
          type="submit"
          className="btn-primary w-full text-lg"
          disabled={cargando}
          style={{ minHeight: "56px" }}
        >
          {cargando ? "Guardando…" : "Guardar perfil de salud"}
        </button>
      </div>
    </form>
  );
}

function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
