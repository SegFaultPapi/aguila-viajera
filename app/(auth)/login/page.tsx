"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { useStore } from "@/lib/store";
import { PRIVY_ACTIVO } from "@/lib/providers";

/* ── Tipos auxiliares ───────────────────────────────────── */

type PasoUI = "telefono" | "otp" | "no_encontrado";

/* ── Helpers ────────────────────────────────────────────── */

function formatearTelefono(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  return `${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6)}`;
}

/** Normaliza cualquier formato de teléfono a dígitos puros (sin código de país) */
function normalizarDigitos(tel: string): string {
  const digits = tel.replace(/\D/g, "");
  // Quitar código de país 52 si viene en E.164
  if (digits.startsWith("52") && digits.length === 12) return digits.slice(2);
  if (digits.startsWith("521") && digits.length === 13) return digits.slice(3);
  return digits.slice(-10);
}

/** Convierte teléfono local (10 dígitos) a E.164 para Privy */
function aE164(tel: string): string {
  const digits = tel.replace(/\D/g, "").slice(-10);
  return `+52${digits}`;
}

/* ── Subcomponente: inputs OTP ──────────────────────────── */

function OtpInputs({
  value,
  onChange,
  hasError,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  hasError: boolean;
}) {
  const refs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => { refs[0].current?.focus(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleChange(index: number, v: string) {
    const digit = v.replace(/\D/g, "").slice(-1);
    const next = [...value];
    next[index] = digit;
    onChange(next);
    if (digit && index < refs.length - 1) refs[index + 1].current?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      refs[index - 1].current?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const texto = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, refs.length);
    if (texto.length >= 4) {
      e.preventDefault();
      const next = texto.padEnd(refs.length, "").split("").slice(0, refs.length);
      onChange(next);
      refs[Math.min(texto.length, refs.length) - 1].current?.focus();
    }
  }

  return (
    <div className="flex justify-center gap-2" onPaste={handlePaste}>
      {value.map((digit, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="h-14 w-11 rounded-xl border-2 text-center text-xl font-extrabold outline-none"
          style={{
            borderColor: hasError
              ? "var(--color-alert)"
              : digit
              ? "var(--color-primary)"
              : "var(--color-border)",
            background: digit ? "var(--color-primary-soft)" : "white",
            transition: "border-color 0.15s, background 0.15s",
          }}
          aria-label={`Dígito ${i + 1} del código`}
        />
      ))}
    </div>
  );
}

/* ── Login con Privy (SMS real) ─────────────────────────── */

function LoginConPrivy() {
  // Importación dinámica de hooks de Privy para que Next.js no falle
  // cuando Privy no está disponible en modo prototipo.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useLoginWithSms } = require("@privy-io/react-auth");
  const router = useRouter();
  const { usuarioPorTelefono, setCurrentUserId } = useStore();

  const [paso, setPaso] = useState<PasoUI>("telefono");
  const [telefono, setTelefono] = useState("");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [errorMsg, setErrorMsg] = useState("");

  const telefonoRef = useRef(telefono);
  telefonoRef.current = telefono;

  const onComplete = useCallback(
    // Privy llama esto cuando el código es correcto
    ({ user }: { user: { phone?: { number: string } } }) => {
      const e164 = user?.phone?.number ?? "";
      const norm = normalizarDigitos(e164 || telefonoRef.current);
      const usuarioStore = usuarioPorTelefono(norm);
      if (usuarioStore) {
        setCurrentUserId(usuarioStore.id);
        router.push("/excursiones");
      } else {
        setPaso("no_encontrado");
      }
    },
    [usuarioPorTelefono, setCurrentUserId, router]
  );

  const onError = useCallback((error: { message?: string }) => {
    setErrorMsg(error?.message ?? "Código incorrecto. Inténtalo de nuevo.");
  }, []);

  const { sendCode, loginWithCode, state } = useLoginWithSms({ onComplete, onError });

  const status: string = state?.status ?? "initial";
  const cargandoEnvio = status === "sending-code";
  const cargandoVerif = status === "submitting-code";

  async function handleTelefonoSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (telefono.replace(/\D/g, "").length < 10) return;
    setErrorMsg("");
    try {
      await sendCode({ phoneNumber: aE164(telefono) });
      setPaso("otp");
    } catch {
      setErrorMsg("No se pudo enviar el código. Verifica el número e intenta de nuevo.");
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    const codigo = otp.join("");
    if (codigo.length < 6) return;
    setErrorMsg("");
    try {
      await loginWithCode({ code: codigo });
    } catch {
      // onError se encarga de setErrorMsg
    }
  }

  return (
    <LoginUI
      paso={paso}
      setPaso={setPaso}
      telefono={telefono}
      setTelefono={setTelefono}
      otp={otp}
      setOtp={setOtp}
      errorMsg={errorMsg}
      cargandoEnvio={cargandoEnvio}
      cargandoVerif={cargandoVerif}
      onTelefonoSubmit={handleTelefonoSubmit}
      onOtpSubmit={handleOtpSubmit}
      modoPrivy
    />
  );
}

/* ── Login modo prototipo (OTP simulado) ────────────────── */

function LoginMock() {
  const router = useRouter();
  const { usuarioPorTelefono, setCurrentUserId } = useStore();

  const [paso, setPaso] = useState<PasoUI>("telefono");
  const [telefono, setTelefono] = useState("");
  const [otp, setOtp] = useState(Array(4).fill(""));
  const [errorMsg, setErrorMsg] = useState("");
  const [cargandoEnvio, setCargandoEnvio] = useState(false);
  const [cargandoVerif, setCargandoVerif] = useState(false);

  function handleTelefonoSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (telefono.replace(/\D/g, "").length < 10) return;
    setCargandoEnvio(true);
    setTimeout(() => { setCargandoEnvio(false); setPaso("otp"); }, 900);
  }

  function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    const codigo = otp.join("");
    if (codigo.length < 4) return;
    setCargandoVerif(true);
    setTimeout(() => {
      setCargandoVerif(false);
      const usuario = usuarioPorTelefono(normalizarDigitos(telefono));
      if (!usuario) { setPaso("no_encontrado"); return; }
      setCurrentUserId(usuario.id);
      router.push("/excursiones");
    }, 700);
  }

  return (
    <LoginUI
      paso={paso}
      setPaso={setPaso}
      telefono={telefono}
      setTelefono={setTelefono}
      otp={otp}
      setOtp={setOtp}
      errorMsg={errorMsg}
      cargandoEnvio={cargandoEnvio}
      cargandoVerif={cargandoVerif}
      onTelefonoSubmit={handleTelefonoSubmit}
      onOtpSubmit={handleOtpSubmit}
      modoPrivy={false}
    />
  );
}

/* ── UI compartida ──────────────────────────────────────── */

interface LoginUIProps {
  paso: PasoUI;
  setPaso: (p: PasoUI) => void;
  telefono: string;
  setTelefono: (t: string) => void;
  otp: string[];
  setOtp: (o: string[]) => void;
  errorMsg: string;
  cargandoEnvio: boolean;
  cargandoVerif: boolean;
  onTelefonoSubmit: (e: React.FormEvent) => void;
  onOtpSubmit: (e: React.FormEvent) => void;
  modoPrivy: boolean;
}

function LoginUI({
  paso, setPaso,
  telefono, setTelefono,
  otp, setOtp,
  errorMsg,
  cargandoEnvio, cargandoVerif,
  onTelefonoSubmit, onOtpSubmit,
  modoPrivy,
}: LoginUIProps) {
  const otpValido = otp.join("").length >= (modoPrivy ? 6 : 4);

  return (
    <div className="w-full max-w-md">
      <div className="card" style={{ padding: "2rem" }}>
        <div className="mb-8 text-center">
          <span className="text-5xl" aria-hidden>📱</span>
          <h1 className="mt-3 text-2xl font-extrabold">Iniciar sesión</h1>
          <p className="mt-1" style={{ color: "var(--color-ink-soft)" }}>
            Ingresa con tu número de teléfono celular
          </p>
        </div>

        {/* ── Paso: teléfono ── */}
        {paso === "telefono" && (
          <form onSubmit={onTelefonoSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="telefono" className="font-semibold">Número de celular</label>
              <div
                className="flex items-center gap-2 rounded-xl border-2 bg-white px-4 py-3"
                style={{ borderColor: "var(--color-border)" }}
              >
                <span className="text-lg font-bold" style={{ color: "var(--color-ink-soft)" }}>
                  🇲🇽 +52
                </span>
                <input
                  id="telefono"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="55 1234 5678"
                  value={telefono}
                  onChange={(e) => setTelefono(formatearTelefono(e.target.value))}
                  className="flex-1 bg-transparent outline-none text-lg"
                  aria-label="Número de celular a 10 dígitos"
                  required
                />
              </div>
              <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
                Te enviaremos un código de verificación por SMS.
              </p>
            </div>

            {errorMsg && (
              <p className="text-sm font-semibold" style={{ color: "var(--color-alert)" }}>{errorMsg}</p>
            )}

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={telefono.replace(/\D/g, "").length < 10 || cargandoEnvio}
            >
              {cargandoEnvio ? "Enviando código…" : "Enviar código →"}
            </button>

            {!modoPrivy && (
              <div className="info-box text-sm flex gap-2 items-start">
                <span aria-hidden className="text-lg flex-shrink-0">🔬</span>
                <span>
                  <strong>Modo prototipo:</strong> Usa el teléfono de un usuario de demostración:
                  <br />Elena: <code>55 1234 5678</code> · Raúl: <code>55 2468 1357</code>
                </span>
              </div>
            )}

            {modoPrivy && (
              <div className="info-box text-sm flex gap-2 items-start">
                <span aria-hidden className="text-lg flex-shrink-0">🔒</span>
                <span>Recibirás un SMS con tu código de verificación de 6 dígitos.</span>
              </div>
            )}
          </form>
        )}

        {/* ── Paso: OTP ── */}
        {paso === "otp" && (
          <form onSubmit={onOtpSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <p className="text-center" style={{ color: "var(--color-ink-soft)" }}>
                Código enviado a <strong style={{ color: "var(--color-ink)" }}>+52 {telefono}</strong>
              </p>
              <label className="font-semibold">
                Código de {modoPrivy ? "6" : "4"} dígitos
              </label>
              <OtpInputs
                value={otp}
                onChange={setOtp}
                hasError={!!errorMsg}
              />
              {errorMsg && (
                <p className="text-center text-sm font-semibold" style={{ color: "var(--color-alert)" }}>
                  {errorMsg}
                </p>
              )}
            </div>

            {!modoPrivy && (
              <div className="info-box text-sm flex gap-2 items-start">
                <span aria-hidden className="text-lg flex-shrink-0">🔬</span>
                <span><strong>Modo prototipo:</strong> Cualquier combinación de 4 dígitos funciona.</span>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={!otpValido || cargandoVerif}
            >
              {cargandoVerif ? "Verificando…" : "Verificar código →"}
            </button>

            <button
              type="button"
              className="text-sm text-center underline underline-offset-2"
              style={{ color: "var(--color-ink-soft)" }}
              onClick={() => { setPaso("telefono"); setOtp(Array(modoPrivy ? 6 : 4).fill("")); }}
            >
              Cambiar número
            </button>
          </form>
        )}

        {/* ── No encontrado ── */}
        {paso === "no_encontrado" && (
          <div className="flex flex-col gap-5 text-center">
            <span className="text-5xl" aria-hidden>🔍</span>
            <div>
              <p className="font-bold text-lg">No encontramos una cuenta</p>
              <p className="mt-1" style={{ color: "var(--color-ink-soft)" }}>
                El número <strong>+52 {telefono}</strong> no está registrado aún.
              </p>
            </div>
            <Link
              href={`/registro?telefono=${telefono.replace(/\s/g, "")}`}
              className="btn-primary"
            >
              Crear cuenta nueva →
            </Link>
            <button
              type="button"
              className="text-sm underline underline-offset-2"
              style={{ color: "var(--color-ink-soft)" }}
              onClick={() => { setPaso("telefono"); setOtp(Array(modoPrivy ? 6 : 4).fill("")); }}
            >
              Intentar con otro número
            </button>
          </div>
        )}
      </div>

      {paso === "telefono" && (
        <p className="mt-6 text-center text-sm" style={{ color: "var(--color-ink-soft)" }}>
          ¿Aún no tienes cuenta?{" "}
          <Link
            href="/registro"
            className="font-bold underline underline-offset-2"
            style={{ color: "var(--color-primary)" }}
          >
            Regístrate aquí
          </Link>
        </p>
      )}
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────── */

export default function LoginPage() {
  return PRIVY_ACTIVO ? <LoginConPrivy /> : <LoginMock />;
}
