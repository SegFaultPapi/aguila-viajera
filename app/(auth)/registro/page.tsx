"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useRef, useCallback } from "react";
import { useStore } from "@/lib/store";
import { PRIVY_ACTIVO } from "@/lib/providers";
import type { Rol } from "@/lib/types";

/* ── Helpers ────────────────────────────────────────────── */

function formatearTelefono(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  return `${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6)}`;
}

function aE164(tel: string): string {
  return `+52${tel.replace(/\D/g, "").slice(-10)}`;
}

function normalizarDigitos(tel: string): string {
  const d = tel.replace(/\D/g, "");
  if (d.startsWith("52") && d.length === 12) return d.slice(2);
  if (d.startsWith("521") && d.length === 13) return d.slice(3);
  return d.slice(-10);
}

const COLONIAS = [
  "San Miguel Teotongo",
  "Santa Cruz Meyehualco",
  "Iztapalapa Centro",
  "Consejo Agrarista Mexicano",
  "La Purísima",
  "Lomas de la Estancia",
  "Paraje San Juan",
  "San Lorenzo Tezonco",
  "Tlaltenco",
  "Zapotitla",
  "Otra colonia",
];

const ROLES: {
  value: Rol;
  emoji: string;
  titulo: string;
  descripcion: string;
  color: string;
  bg: string;
}[] = [
  {
    value: "adulto_mayor",
    emoji: "👴",
    titulo: "Adulto mayor",
    descripcion: "Quiero inscribirme a excursiones y llevar mi perfil de salud.",
    color: "var(--color-primary)",
    bg: "var(--color-primary-soft)",
  },
  {
    value: "familiar",
    emoji: "👩",
    titulo: "Familiar / cuidador",
    descripcion: "Quiero apoyar a mi familiar mayor con su perfil y sus inscripciones.",
    color: "var(--color-accent)",
    bg: "var(--color-accent-soft)",
  },
  {
    value: "coordinador",
    emoji: "📋",
    titulo: "Coordinador COPACO",
    descripcion: "Quiero crear y gestionar excursiones para mi colonia.",
    color: "#7c3aed",
    bg: "#ede9fe",
  },
];

/* ── Indicador de pasos ─────────────────────────────────── */

function PasoIndicador({ actual, total }: { actual: number; total: number }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: i + 1 === actual ? "2rem" : "0.625rem",
            height: "0.625rem",
            background: i + 1 <= actual ? "var(--color-primary)" : "var(--color-border)",
          }}
        />
      ))}
    </div>
  );
}

/* ── OTP inputs ─────────────────────────────────────────── */

function OtpInputs({
  value,
  onChange,
  hasError,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  hasError: boolean;
}) {
  const inputRefs = value.map(() => useRef<HTMLInputElement>(null)); // eslint-disable-line react-hooks/rules-of-hooks

  function handleChange(index: number, v: string) {
    const digit = v.replace(/\D/g, "").slice(-1);
    const next = [...value];
    next[index] = digit;
    onChange(next);
    if (digit && index < inputRefs.length - 1) inputRefs[index + 1].current?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const texto = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, inputRefs.length);
    if (texto.length >= 4) {
      e.preventDefault();
      const next = texto.padEnd(inputRefs.length, "").split("").slice(0, inputRefs.length);
      onChange(next);
    }
  }

  return (
    <div className="flex justify-center gap-2" onPaste={handlePaste}>
      {value.map((digit, i) => (
        <input
          key={i}
          ref={inputRefs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="h-14 w-11 rounded-xl border-2 text-center text-xl font-extrabold outline-none"
          style={{
            borderColor: hasError ? "var(--color-alert)" : digit ? "var(--color-primary)" : "var(--color-border)",
            background: digit ? "var(--color-primary-soft)" : "white",
            transition: "border-color 0.15s, background 0.15s",
          }}
          aria-label={`Dígito ${i + 1} del código`}
        />
      ))}
    </div>
  );
}

/* ── Estado compartido del formulario ───────────────────── */

interface DatosForm {
  nombre: string;
  telefono: string;
  email: string;
  colonia: string;
  telefonoFamiliar: string;
  comision: string;
}

/* ── Core del wizard (compartido Privy / Mock) ──────────── */

function useWizard(initialTelefono: string, initialEmail = "") {
  const [paso, setPaso] = useState(1);
  const [rolSeleccionado, setRolSeleccionado] = useState<Rol | null>(null);
  const [datos, setDatos] = useState<DatosForm>({
    nombre: "",
    telefono: initialTelefono,
    email: initialEmail,
    colonia: "",
    telefonoFamiliar: "",
    comision: "",
  });
  const [errorForm, setErrorForm] = useState("");
  const totalPasos =
    rolSeleccionado === "familiar" || rolSeleccionado === "coordinador" ? 5 : 4;

  return { paso, setPaso, rolSeleccionado, setRolSeleccionado, datos, setDatos, errorForm, setErrorForm, totalPasos };
}

/* ── Wizard con Privy ───────────────────────────────────── */

function RegistroConPrivy({ initialTelefono, initialEmail }: { initialTelefono: string; initialEmail: string }) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useLoginWithEmail } = require("@privy-io/react-auth");
  const router = useRouter();
  const { usuarioPorEmail, usuarioPorTelefono, registrarUsuario, vincularFamiliar, setCurrentUserId } = useStore();

  const wiz = useWizard(initialTelefono, initialEmail);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [otpError, setOtpError] = useState("");
  const [cargandoEnvio, setCargandoEnvio] = useState(false);
  const [cargandoVerif, setCargandoVerif] = useState(false);
  const [exito, setExito] = useState(false);

  const datosRef = useRef(wiz.datos);
  datosRef.current = wiz.datos;
  const rolRef = useRef(wiz.rolSeleccionado);
  rolRef.current = wiz.rolSeleccionado;

  const onComplete = useCallback(
    ({ user }: { user: { email?: { address: string } } }) => {
      const datos = datosRef.current;
      const rol = rolRef.current;
      if (!rol) return;

      const emailVerificado = user?.email?.address ?? datos.email;

      const existente = usuarioPorEmail(emailVerificado);
      if (existente) {
        router.push("/login?ya_registrado=1");
        return;
      }

      const nuevo = registrarUsuario({
        nombre: datos.nombre.trim(),
        rol,
        telefono: datos.telefono,
        colonia: datos.colonia,
        email: emailVerificado,
      });

      if (rol === "familiar" && datos.telefonoFamiliar) {
        const adulto = usuarioPorTelefono(normalizarDigitos(datos.telefonoFamiliar));
        if (adulto) vincularFamiliar(adulto.id, nuevo.id);
      }

      setCurrentUserId(nuevo.id);
      setExito(true);
    },
    [registrarUsuario, vincularFamiliar, setCurrentUserId, usuarioPorEmail, usuarioPorTelefono, router]
  );

  const onError = useCallback((error: { message?: string }) => {
    setOtpError(error?.message ?? "Código incorrecto. Inténtalo de nuevo.");
    setCargandoVerif(false);
  }, []);

  const { sendCode, loginWithCode } = useLoginWithEmail({ onComplete, onError });

  async function handleEnviarOtp() {
    wiz.setErrorForm("");
    const emailValue = wiz.datos.email.trim();
    if (!emailValue.includes("@")) {
      wiz.setErrorForm("Ingresa un correo electrónico válido para verificar tu cuenta.");
      return;
    }
    setCargandoEnvio(true);
    try {
      await sendCode({ email: emailValue });
      wiz.setPaso(wiz.paso + 1);
    } catch {
      wiz.setErrorForm("No se pudo enviar el código. Verifica el correo e intenta de nuevo.");
    } finally {
      setCargandoEnvio(false);
    }
  }

  async function handleVerificarOtp() {
    setOtpError("");
    setCargandoVerif(true);
    try {
      await loginWithCode({ code: otp.join("") });
    } catch {
      // onError se encarga del mensaje
    }
  }

  return (
    <WizardUI
      {...wiz}
      otp={otp}
      setOtp={setOtp}
      otpError={otpError}
      cargandoEnvio={cargandoEnvio}
      cargandoVerif={cargandoVerif}
      exito={exito}
      modoPrivy
      onEnviarOtp={handleEnviarOtp}
      onVerificarOtp={handleVerificarOtp}
      onEntrar={() => router.push("/excursiones")}
    />
  );
}

/* ── Wizard modo prototipo ──────────────────────────────── */

function RegistroMock({ initialTelefono, initialEmail }: { initialTelefono: string; initialEmail: string }) {
  const router = useRouter();
  const { usuarioPorTelefono, registrarUsuario, vincularFamiliar, setCurrentUserId } = useStore();

  const wiz = useWizard(initialTelefono, initialEmail);
  const [otp, setOtp] = useState(Array(4).fill(""));
  const [otpError] = useState("");
  const [cargandoEnvio, setCargandoEnvio] = useState(false);
  const [cargandoVerif, setCargandoVerif] = useState(false);
  const [exito, setExito] = useState(false);

  function handleEnviarOtp() {
    setCargandoEnvio(true);
    setTimeout(() => { setCargandoEnvio(false); wiz.setPaso(wiz.paso + 1); }, 900);
  }

  function handleVerificarOtp() {
    const { datos, rolSeleccionado } = wiz;
    if (!rolSeleccionado) return;
    setCargandoVerif(true);
    setTimeout(() => {
      setCargandoVerif(false);
      const existente = usuarioPorTelefono(normalizarDigitos(datos.telefono));
      if (existente) { router.push("/login?ya_registrado=1"); return; }
      const nuevo = registrarUsuario({
        nombre: datos.nombre.trim(),
        rol: rolSeleccionado,
        telefono: datos.telefono,
        colonia: datos.colonia,
        email: datos.email.trim() || undefined,
      });
      if (rolSeleccionado === "familiar" && datos.telefonoFamiliar) {
        const adulto = usuarioPorTelefono(normalizarDigitos(datos.telefonoFamiliar));
        if (adulto) vincularFamiliar(adulto.id, nuevo.id);
      }
      setCurrentUserId(nuevo.id);
      setExito(true);
    }, 700);
  }

  return (
    <WizardUI
      {...wiz}
      otp={otp}
      setOtp={setOtp}
      otpError={otpError}
      cargandoEnvio={cargandoEnvio}
      cargandoVerif={cargandoVerif}
      exito={exito}
      modoPrivy={false}
      onEnviarOtp={handleEnviarOtp}
      onVerificarOtp={handleVerificarOtp}
      onEntrar={() => router.push("/excursiones")}
    />
  );
}

/* ── UI compartida del wizard ───────────────────────────── */

interface WizardUIProps {
  paso: number;
  setPaso: (p: number) => void;
  rolSeleccionado: Rol | null;
  setRolSeleccionado: (r: Rol) => void;
  datos: DatosForm;
  setDatos: (d: DatosForm) => void;
  errorForm: string;
  setErrorForm: (e: string) => void;
  totalPasos: number;
  otp: string[];
  setOtp: (o: string[]) => void;
  otpError: string;
  cargandoEnvio: boolean;
  cargandoVerif: boolean;
  exito: boolean;
  modoPrivy: boolean;
  onEnviarOtp: () => void;
  onVerificarOtp: () => void;
  onEntrar: () => void;
}

function WizardUI({
  paso, setPaso,
  rolSeleccionado, setRolSeleccionado,
  datos, setDatos,
  errorForm, setErrorForm,
  totalPasos,
  otp, setOtp,
  otpError,
  cargandoEnvio, cargandoVerif,
  exito, modoPrivy,
  onEnviarOtp, onVerificarOtp, onEntrar,
}: WizardUIProps) {

  function validarDatos(): string {
    if (!datos.nombre.trim()) return "El nombre es obligatorio.";
    if (datos.telefono.replace(/\D/g, "").length < 10) return "Ingresa un número de 10 dígitos.";
    if (!datos.colonia) return "Selecciona tu colonia.";
    return "";
  }

  function handleDatosSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validarDatos();
    if (err) { setErrorForm(err); return; }
    setErrorForm("");
    setPaso(paso + 1);
  }

  function handlePaso3Submit(e: React.FormEvent) {
    e.preventDefault();
    // Paso 3 es datos extra (familiar/coord) → ir al paso de OTP
    setPaso(paso + 1);
  }

  const otpLongitudOk = otp.join("").length >= (modoPrivy ? 6 : 4);

  return (
    <div className="w-full max-w-lg">
      <div className="card" style={{ padding: "2rem" }}>

        {/* ── Paso 1: selección de rol ── */}
        {paso === 1 && (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-extrabold">Crear cuenta</h1>
              <p className="mt-1" style={{ color: "var(--color-ink-soft)" }}>
                ¿Cómo vas a usar Águila Viajera?
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => { setRolSeleccionado(r.value); setPaso(2); }}
                  className="flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all duration-150"
                  style={{ borderColor: "var(--color-border)", background: "white", minHeight: "72px" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = r.color;
                    (e.currentTarget as HTMLElement).style.background = r.bg;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
                    (e.currentTarget as HTMLElement).style.background = "white";
                  }}
                >
                  <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-2xl" style={{ background: r.bg }}>
                    {r.emoji}
                  </span>
                  <div>
                    <p className="font-extrabold">{r.titulo}</p>
                    <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>{r.descripcion}</p>
                  </div>
                  <span className="ml-auto text-xl" style={{ color: "var(--color-ink-soft)" }}>→</span>
                </button>
              ))}
            </div>
            <p className="mt-6 text-center text-sm" style={{ color: "var(--color-ink-soft)" }}>
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="font-bold underline underline-offset-2" style={{ color: "var(--color-primary)" }}>
                Iniciar sesión
              </Link>
            </p>
          </>
        )}

        {/* ── Paso 2: datos personales ── */}
        {paso === 2 && rolSeleccionado && (
          <>
            <PasoIndicador actual={2} total={totalPasos} />
            <button type="button" onClick={() => setPaso(1)} className="text-sm mb-4 flex items-center gap-1" style={{ color: "var(--color-ink-soft)" }}>
              ← Cambiar tipo de cuenta
            </button>
            <h2 className="text-xl font-extrabold mb-1">Tus datos personales</h2>
            <p className="text-sm mb-6" style={{ color: "var(--color-ink-soft)" }}>
              Solo pedimos lo necesario. El teléfono es tu identificador.
            </p>
            <form onSubmit={handleDatosSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="nombre" className="font-semibold">
                  Nombre completo <span style={{ color: "var(--color-alert)" }}>*</span>
                </label>
                <input
                  id="nombre" type="text" autoComplete="name"
                  placeholder="Ej. Elena Martínez García"
                  value={datos.nombre}
                  onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
                  className="rounded-xl border-2 bg-white px-4 py-3 outline-none text-lg"
                  style={{ borderColor: "var(--color-border)" }}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="telefono-reg" className="font-semibold">
                  Número de celular <span style={{ color: "var(--color-alert)" }}>*</span>
                </label>
                <div className="flex items-center gap-2 rounded-xl border-2 bg-white px-4 py-3" style={{ borderColor: "var(--color-border)" }}>
                  <span className="text-lg font-bold" style={{ color: "var(--color-ink-soft)" }}>🇲🇽 +52</span>
                  <input
                    id="telefono-reg" type="tel" inputMode="numeric" autoComplete="tel-national"
                    placeholder="55 1234 5678"
                    value={datos.telefono}
                    onChange={(e) => { setDatos({ ...datos, telefono: formatearTelefono(e.target.value) }); setErrorForm(""); }}
                    className="flex-1 bg-transparent outline-none text-lg"
                    required
                  />
                </div>
                {errorForm && (
                  <p className="text-sm font-semibold" style={{ color: "var(--color-alert)" }}>{errorForm}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="font-semibold">
                  Correo electrónico{" "}
                  <span className="text-sm font-normal" style={{ color: "var(--color-ink-soft)" }}>(opcional)</span>
                </label>
                <input
                  id="email" type="email" autoComplete="email"
                  placeholder="ejemplo@correo.com"
                  value={datos.email}
                  onChange={(e) => setDatos({ ...datos, email: e.target.value })}
                  className="rounded-xl border-2 bg-white px-4 py-3 outline-none text-lg"
                  style={{ borderColor: "var(--color-border)" }}
                />
                <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
                  Muchos adultos mayores no tienen correo — por eso es opcional.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="colonia" className="font-semibold">
                  Colonia <span style={{ color: "var(--color-alert)" }}>*</span>
                </label>
                <select
                  id="colonia" value={datos.colonia}
                  onChange={(e) => setDatos({ ...datos, colonia: e.target.value })}
                  className="rounded-xl border-2 bg-white px-4 py-3 outline-none text-lg"
                  style={{ borderColor: "var(--color-border)" }}
                  required
                >
                  <option value="">Selecciona tu colonia…</option>
                  {COLONIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="info-box text-sm flex gap-2 items-start">
                <span aria-hidden className="text-lg flex-shrink-0">🔒</span>
                <span>
                  Tus datos son visibles solo para ti, tus familiares autorizados y el coordinador
                  de las excursiones en las que participes.
                </span>
              </div>

              <button type="submit" className="btn-primary w-full">Continuar →</button>
            </form>
          </>
        )}

        {/* ── Paso 3: datos extra (familiar / coordinador) ── */}
        {paso === 3 && rolSeleccionado === "familiar" && (
          <>
            <PasoIndicador actual={3} total={totalPasos} />
            <button type="button" onClick={() => setPaso(2)} className="text-sm mb-4 flex items-center gap-1" style={{ color: "var(--color-ink-soft)" }}>
              ← Regresar
            </button>
            <h2 className="text-xl font-extrabold mb-1">Vincula a tu familiar</h2>
            <p className="text-sm mb-6" style={{ color: "var(--color-ink-soft)" }}>
              Ingresa el número del adulto mayor al que vas a apoyar.
            </p>
            <form onSubmit={handlePaso3Submit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="tel-familiar" className="font-semibold">
                  Celular del adulto mayor{" "}
                  <span className="text-sm font-normal" style={{ color: "var(--color-ink-soft)" }}>(opcional)</span>
                </label>
                <div className="flex items-center gap-2 rounded-xl border-2 bg-white px-4 py-3" style={{ borderColor: "var(--color-border)" }}>
                  <span className="text-lg font-bold" style={{ color: "var(--color-ink-soft)" }}>🇲🇽 +52</span>
                  <input
                    id="tel-familiar" type="tel" inputMode="numeric"
                    placeholder="55 1234 5678"
                    value={datos.telefonoFamiliar}
                    onChange={(e) => setDatos({ ...datos, telefonoFamiliar: formatearTelefono(e.target.value) })}
                    className="flex-1 bg-transparent outline-none text-lg"
                  />
                </div>
              </div>
              <div className="info-box text-sm flex gap-2 items-start">
                <span aria-hidden className="text-lg flex-shrink-0">👁️</span>
                <span>Al vincularte podrás ver y editar el perfil de salud de tu familiar.</span>
              </div>
              <button type="submit" className="btn-primary w-full">Continuar →</button>
              <button type="button" className="text-sm text-center underline underline-offset-2"
                style={{ color: "var(--color-ink-soft)" }} onClick={() => setPaso(paso + 1)}>
                Omitir por ahora
              </button>
            </form>
          </>
        )}

        {paso === 3 && rolSeleccionado === "coordinador" && (
          <>
            <PasoIndicador actual={3} total={totalPasos} />
            <button type="button" onClick={() => setPaso(2)} className="text-sm mb-4 flex items-center gap-1" style={{ color: "var(--color-ink-soft)" }}>
              ← Regresar
            </button>
            <h2 className="text-xl font-extrabold mb-1">Datos de coordinador</h2>
            <p className="text-sm mb-6" style={{ color: "var(--color-ink-soft)" }}>
              Tu cuenta requiere validación por un admin COPACO antes de publicar excursiones.
            </p>
            <form onSubmit={handlePaso3Submit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="comision" className="font-semibold">
                  Nombre de tu comisión{" "}
                  <span className="text-sm font-normal" style={{ color: "var(--color-ink-soft)" }}>(opcional)</span>
                </label>
                <input
                  id="comision" type="text"
                  placeholder="Ej. Comisión de Adultos Mayores"
                  value={datos.comision}
                  onChange={(e) => setDatos({ ...datos, comision: e.target.value })}
                  className="rounded-xl border-2 bg-white px-4 py-3 outline-none"
                  style={{ borderColor: "var(--color-border)" }}
                />
              </div>
              <div className="rounded-2xl border-2 p-4 flex gap-3" style={{ borderColor: "#7c3aed", background: "#ede9fe" }}>
                <span className="text-2xl flex-shrink-0" aria-hidden>⏳</span>
                <div className="text-sm">
                  <p className="font-bold" style={{ color: "#5b21b6" }}>Validación pendiente</p>
                  <p style={{ color: "#6d28d9" }}>Un administrador COPACO revisará tu solicitud.</p>
                </div>
              </div>
              <button type="submit" className="btn-primary w-full">Continuar →</button>
            </form>
          </>
        )}

        {/* ── Paso OTP: verificación de correo ── */}
        {((paso === 3 && rolSeleccionado === "adulto_mayor") ||
          (paso === 4 && (rolSeleccionado === "familiar" || rolSeleccionado === "coordinador"))) && (
          <>
            <PasoIndicador actual={paso} total={totalPasos} />
            <button type="button" onClick={() => setPaso(paso - 1)} className="text-sm mb-4 flex items-center gap-1" style={{ color: "var(--color-ink-soft)" }}>
              ← Regresar
            </button>
            <h2 className="text-xl font-extrabold mb-1">Verifica tu correo</h2>
            <p className="text-sm mb-6" style={{ color: "var(--color-ink-soft)" }}>
              {modoPrivy
                ? "Te enviaremos un código a tu correo para confirmar tu cuenta."
                : "Confirma tu correo antes de crear la cuenta."}
            </p>

            {/* Resumen antes del OTP */}
            <div className="rounded-2xl p-4 mb-5 flex flex-col gap-1 text-sm" style={{ background: "var(--color-bg-alt)" }}>
              <p><strong>Nombre:</strong> {datos.nombre}</p>
              {datos.email && <p><strong>Correo:</strong> {datos.email}</p>}
              <p><strong>Teléfono:</strong> +52 {datos.telefono}</p>
              <p><strong>Colonia:</strong> {datos.colonia}</p>
            </div>

            {modoPrivy && !datos.email.includes("@") && (
              <div className="alert-box text-sm mb-4">
                Necesitas ingresar un correo electrónico válido en el paso anterior para verificar tu cuenta.
              </div>
            )}

            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={onEnviarOtp}
                className="btn-secondary w-full"
                disabled={cargandoEnvio || (modoPrivy && !datos.email.includes("@"))}
              >
                {cargandoEnvio ? "Enviando código…" : datos.email ? `Enviar código a ${datos.email}` : "Enviar código de verificación"}
              </button>

              {cargandoEnvio === false && otp.some((d) => d !== "") && (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="font-semibold">
                      Código de {modoPrivy ? "6" : "4"} dígitos
                    </label>
                    <OtpInputs value={otp} onChange={setOtp} hasError={!!otpError} />
                    {otpError && (
                      <p className="text-center text-sm font-semibold" style={{ color: "var(--color-alert)" }}>
                        {otpError}
                      </p>
                    )}
                    {!modoPrivy && (
                      <p className="text-center text-sm" style={{ color: "var(--color-ink-soft)" }}>
                        Modo prototipo — cualquier código de 4 dígitos funciona.
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={onVerificarOtp}
                    className="btn-primary w-full"
                    disabled={!otpLongitudOk || cargandoVerif}
                  >
                    {cargandoVerif ? "Creando cuenta…" : "Verificar y crear cuenta →"}
                  </button>
                </>
              )}

              {/* Antes de enviar el código: mostrar inputs vacíos para que el usuario sepa qué esperar */}
              {!cargandoEnvio && !otp.some((d) => d !== "") && (
                <p className="text-center text-sm" style={{ color: "var(--color-ink-soft)" }}>
                  Toca el botón para recibir el SMS.
                </p>
              )}
            </div>
          </>
        )}

        {/* ── Éxito ── */}
        {exito && (
          <div className="flex flex-col items-center gap-6 text-center py-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full text-4xl" style={{ background: "var(--color-primary-soft)" }}>
              ✅
            </div>
            <div>
              <h2 className="text-2xl font-extrabold">¡Cuenta creada!</h2>
              <p className="mt-2" style={{ color: "var(--color-ink-soft)" }}>
                Bienvenido/a a Águila Viajera, <strong>{datos.nombre}</strong>.
              </p>
              {rolSeleccionado === "coordinador" && (
                <p className="mt-2 text-sm" style={{ color: "#7c3aed" }}>
                  Tu cuenta de coordinador está pendiente de validación.
                </p>
              )}
            </div>
            <button type="button" onClick={onEntrar} className="btn-primary w-full">
              Entrar a la app →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Inner con searchParams ─────────────────────────────── */

function RegistroInner() {
  const searchParams = useSearchParams();
  const initialTelefono = searchParams.get("telefono")
    ? formatearTelefono(searchParams.get("telefono")!)
    : "";
  const initialEmail = searchParams.get("email") ?? "";

  return PRIVY_ACTIVO ? (
    <RegistroConPrivy initialTelefono={initialTelefono} initialEmail={initialEmail} />
  ) : (
    <RegistroMock initialTelefono={initialTelefono} initialEmail={initialEmail} />
  );
}

/* ── Page ───────────────────────────────────────────────── */

export default function RegistroPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-lg">
        <div className="card flex items-center justify-center" style={{ padding: "3rem" }}>
          <p style={{ color: "var(--color-ink-soft)" }}>Cargando…</p>
        </div>
      </div>
    }>
      <RegistroInner />
    </Suspense>
  );
}
