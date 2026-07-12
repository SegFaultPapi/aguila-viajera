"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { Medicamento, Movilidad } from "@/lib/types";

const CONDICIONES_COMUNES = ["Diabetes", "Hipertensión", "Demencia senil", "Cardiopatía"];

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
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>(
    perfilExistente?.medicamentos ?? []
  );
  const [acompananteRequerido, setAcompananteRequerido] = useState(
    perfilExistente?.acompananteRequerido ?? false
  );
  const [contactoNombre, setContactoNombre] = useState(
    perfilExistente?.contactoEmergencia.nombre ?? ""
  );
  const [contactoTelefono, setContactoTelefono] = useState(
    perfilExistente?.contactoEmergencia.telefono ?? ""
  );
  const [contactoRelacion, setContactoRelacion] = useState(
    perfilExistente?.contactoEmergencia.relacion ?? ""
  );
  const [guardado, setGuardado] = useState(false);

  function toggleCondicion(c: string) {
    setCondiciones((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }

  function agregarMedicamento() {
    setMedicamentos((prev) => [...prev, { nombre: "", horario: "" }]);
  }

  function actualizarMedicamento(idx: number, campo: keyof Medicamento, valor: string) {
    setMedicamentos((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, [campo]: valor } : m))
    );
  }

  function eliminarMedicamento(idx: number) {
    setMedicamentos((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
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
    setGuardado(true);
    setTimeout(() => setGuardado(false), 3000);
  }

  return (
    <form onSubmit={handleGuardar} className="flex flex-col gap-5 pb-10">
      <div>
        <h1 className="text-3xl font-extrabold">Perfil de salud de {usuarioObjetivo.nombre}</h1>
        <p className="mt-1 text-lg" style={{ color: "var(--color-ink-soft)" }}>
          {currentUser.rol === "familiar"
            ? `Lo estás llenando como familiar vinculado de ${usuarioObjetivo.nombre}.`
            : "Puedes llenarlo tú mismo(a) o pedirle a un familiar vinculado que lo haga."}
        </p>
        {perfilExistente && (
          <p className="mt-1 text-sm" style={{ color: "var(--color-ink-soft)" }}>
            Última actualización: {formatFecha(perfilExistente.actualizadoEn)} por{" "}
            {usuarios.find((u) => u.id === perfilExistente.actualizadoPorId)?.nombre ?? "—"}
          </p>
        )}
      </div>

      <div className="info-box">
        🔒 Este perfil solo lo pueden ver: {usuarioObjetivo.nombre}, sus familiares vinculados, y
        el coordinador de la excursión a la que se inscriba — nunca otros participantes.
      </div>

      <fieldset className="card flex flex-col gap-3">
        <legend className="px-1 text-lg font-bold">Movilidad</legend>
        {(
          [
            ["independiente", "🚶 Independiente"],
            ["baston", "🦯 Usa bastón"],
            ["andadera", "🚶‍♀️🦯 Usa andadera"],
            ["silla_ruedas", "♿ Usa silla de ruedas"],
            ["no_aplica", "— No aplica"],
          ] as [Movilidad, string][]
        ).map(([valor, label]) => (
          <label
            key={valor}
            className="flex items-center gap-3 rounded-lg border-2 px-3 py-2.5 transition-colors"
            style={{
              borderColor: movilidad === valor ? "var(--color-primary)" : "var(--color-border)",
              background: movilidad === valor ? "var(--color-primary-soft)" : "transparent",
            }}
          >
            <input
              type="radio"
              name="movilidad"
              value={valor}
              checked={movilidad === valor}
              onChange={() => setMovilidad(valor)}
              className="h-5 w-5"
            />
            {label}
          </label>
        ))}
      </fieldset>

      <fieldset className="card flex flex-col gap-3">
        <legend className="px-1 text-lg font-bold">Condiciones relevantes</legend>
        {CONDICIONES_COMUNES.map((c) => (
          <label key={c} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={condiciones.includes(c)}
              onChange={() => toggleCondicion(c)}
              className="h-5 w-5"
            />
            {c}
          </label>
        ))}
        <label className="flex flex-col gap-1">
          Otra condición (opcional)
          <input
            type="text"
            value={condicionLibre}
            onChange={(e) => setCondicionLibre(e.target.value)}
            className="rounded-lg border px-3 py-2"
            style={{ borderColor: "var(--color-border)" }}
          />
        </label>
        <label className="mt-2 flex items-center gap-2">
          <input
            type="checkbox"
            checked={acompananteRequerido}
            onChange={(e) => setAcompananteRequerido(e.target.checked)}
            className="h-5 w-5"
          />
          Requiere acompañante en excursiones
        </label>
      </fieldset>

      <fieldset className="card flex flex-col gap-3">
        <legend className="px-1 text-lg font-bold">Medicamentos críticos</legend>
        {medicamentos.map((m, idx) => (
          <div key={idx} className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Nombre del medicamento"
              value={m.nombre}
              onChange={(e) => actualizarMedicamento(idx, "nombre", e.target.value)}
              className="flex-1 rounded-lg border px-3 py-2"
              style={{ borderColor: "var(--color-border)" }}
            />
            <input
              type="text"
              placeholder="Horario (ej. 8am y 8pm)"
              value={m.horario}
              onChange={(e) => actualizarMedicamento(idx, "horario", e.target.value)}
              className="flex-1 rounded-lg border px-3 py-2"
              style={{ borderColor: "var(--color-border)" }}
            />
            <button type="button" className="btn-secondary" onClick={() => eliminarMedicamento(idx)}>
              Quitar
            </button>
          </div>
        ))}
        <button type="button" className="btn-secondary w-fit" onClick={agregarMedicamento}>
          + Agregar medicamento
        </button>
      </fieldset>

      <fieldset className="card flex flex-col gap-3">
        <legend className="px-1 text-lg font-bold">Contacto de emergencia</legend>
        <label className="flex flex-col gap-1">
          Nombre
          <input
            type="text"
            required
            value={contactoNombre}
            onChange={(e) => setContactoNombre(e.target.value)}
            className="rounded-lg border px-3 py-2"
            style={{ borderColor: "var(--color-border)" }}
          />
        </label>
        <label className="flex flex-col gap-1">
          Teléfono
          <input
            type="tel"
            required
            value={contactoTelefono}
            onChange={(e) => setContactoTelefono(e.target.value)}
            className="rounded-lg border px-3 py-2"
            style={{ borderColor: "var(--color-border)" }}
          />
        </label>
        <label className="flex flex-col gap-1">
          Relación
          <input
            type="text"
            placeholder="Ej. Hija, esposo, vecina"
            required
            value={contactoRelacion}
            onChange={(e) => setContactoRelacion(e.target.value)}
            className="rounded-lg border px-3 py-2"
            style={{ borderColor: "var(--color-border)" }}
          />
        </label>
      </fieldset>

      <button type="submit" className="btn-primary w-full text-lg">
        Guardar perfil de salud
      </button>
      {guardado && <div className="success-box">✅ Perfil guardado correctamente.</div>}
    </form>
  );
}

function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
}
