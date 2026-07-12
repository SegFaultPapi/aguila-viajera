"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { useStore } from "@/lib/store";
import { PRIVY_ACTIVO } from "@/lib/providers";

/* ── Tipos auxiliares ───────────────────────────────────── */

type PasoUI = "email" | "otp" | "no_encontrado";

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

/* ── Login con Privy (email real) ───────────────────────── */

function LoginConPrivy() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useLoginWithEmail } = require("@privy-io/react-auth");
  const router = useRouter();
  const { usuarioPorEmail, setCurrentUserId } = useStore();

  const [paso, setPaso] = useState<PasoUI>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [errorMsg, setErrorMsg] = useState("");

  const emailRef = useRef(email);
  emailRef.current = email;

  const onComplete = useCallback(
    ({ user }: { user: { email?: { address: string } } }) => {
      const address = user?.email?.address ?? emailRef.current;
      const usuarioStore = usuarioPorEmail(address);
      if (usuarioStore) {
        setCurrentUserId(usuarioStore.id);
        router.push("/excursiones");
      } else {
        setPaso("no_encontrado");
      }
    },
    [usuarioPorEmail, setCurrentUserId, router]
  );

  const onError = useCallback((error: { message?: string }) => {
    setErrorMsg(error?.message ?? "Código incorrecto. Inténtalo de nuevo.");
  }, []);

  const { sendCode, loginWithCode, state } = useLoginWithEmail({ onComplete, onError });

  const status: string = state?.status ?? "initial";
  const cargandoEnvio = status === "sending-code";
  const cargandoVerif = status === "submitting-code";

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setErrorMsg("");
    try {
      await sendCode({ email });
      setPaso("otp");
    } catch {
      setErrorMsg("No se pudo enviar el código. Verifica el correo e intenta de nuevo.");
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
      email={email}
      setEmail={setEmail}
      otp={otp}
      setOtp={setOtp}
      errorMsg={errorMsg}
      cargandoEnvio={cargandoEnvio}
      cargandoVerif={cargandoVerif}
      onEmailSubmit={handleEmailSubmit}
      onOtpSubmit={handleOtpSubmit}
      modoPrivy
    />
  );
}

/* ── Login modo prototipo (OTP simulado) ────────────────── */

function LoginMock() {
  const router = useRouter();
  const { usuarioPorEmail, setCurrentUserId } = useStore();

  const [paso, setPaso] = useState<PasoUI>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(Array(4).fill(""));
  const [errorMsg, setErrorMsg] = useState("");
  const [cargandoEnvio, setCargandoEnvio] = useState(false);
  const [cargandoVerif, setCargandoVerif] = useState(false);

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
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
      const usuario = usuarioPorEmail(email);
      if (!usuario) { setPaso("no_encontrado"); return; }
      setCurrentUserId(usuario.id);
      router.push("/excursiones");
    }, 700);
  }

  return (
    <LoginUI
      paso={paso}
      setPaso={setPaso}
      email={email}
      setEmail={setEmail}
      otp={otp}
      setOtp={setOtp}
      errorMsg={errorMsg}
      cargandoEnvio={cargandoEnvio}
      cargandoVerif={cargandoVerif}
      onEmailSubmit={handleEmailSubmit}
      onOtpSubmit={handleOtpSubmit}
      modoPrivy={false}
    />
  );
}

/* ── UI compartida ──────────────────────────────────────── */

interface LoginUIProps {
  paso: PasoUI;
  setPaso: (p: PasoUI) => void;
  email: string;
  setEmail: (t: string) => void;
  otp: string[];
  setOtp: (o: string[]) => void;
  errorMsg: string;
  cargandoEnvio: boolean;
  cargandoVerif: boolean;
  onEmailSubmit: (e: React.FormEvent) => void;
  onOtpSubmit: (e: React.FormEvent) => void;
  modoPrivy: boolean;
}

function LoginUI({
  paso, setPaso,
  email, setEmail,
  otp, setOtp,
  errorMsg,
  cargandoEnvio, cargandoVerif,
  onEmailSubmit, onOtpSubmit,
  modoPrivy,
}: LoginUIProps) {
  const otpValido = otp.join("").length >= (modoPrivy ? 6 : 4);

  return (
    <div className="w-full max-w-md">
      <div className="card" style={{ padding: "2rem" }}>
        <div className="mb-8 text-center">
          <span className="text-5xl" aria-hidden>✉️</span>
          <h1 className="mt-3 text-2xl font-extrabold">Iniciar sesión</h1>
          <p className="mt-1" style={{ color: "var(--color-ink-soft)" }}>
            Ingresa con tu correo electrónico
          </p>
        </div>

        {/* ── Paso: email ── */}
        {paso === "email" && (
          <form onSubmit={onEmailSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="font-semibold">Correo electrónico</label>
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="tucorreo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border-2 bg-white px-4 py-3 outline-none text-lg w-full"
                style={{ borderColor: "var(--color-border)" }}
                aria-label="Correo electrónico"
                required
              />
              <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
                Te enviaremos un código de verificación a tu correo.
              </p>
            </div>

            {errorMsg && (
              <p className="text-sm font-semibold" style={{ color: "var(--color-alert)" }}>{errorMsg}</p>
            )}

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={!email.includes("@") || cargandoEnvio}
            >
              {cargandoEnvio ? "Enviando código…" : "Enviar código →"}
            </button>

            {!modoPrivy && (
              <div className="info-box text-sm flex gap-2 items-start">
                <span aria-hidden className="text-lg flex-shrink-0">🔬</span>
                <span>
                  <strong>Modo prototipo:</strong> Usa el correo de un usuario de demostración:
                  <br />Elena: <code>elena@demo.aguila.mx</code>
                  <br />Raúl: <code>raul@demo.aguila.mx</code>
                </span>
              </div>
            )}

            {modoPrivy && (
              <div className="info-box text-sm flex gap-2 items-start">
                <span aria-hidden className="text-lg flex-shrink-0">🔒</span>
                <span>Recibirás un código de verificación en tu bandeja de entrada.</span>
              </div>
            )}
          </form>
        )}

        {/* ── Paso: OTP ── */}
        {paso === "otp" && (
          <form onSubmit={onOtpSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <p className="text-center" style={{ color: "var(--color-ink-soft)" }}>
                Código enviado a <strong style={{ color: "var(--color-ink)" }}>{email}</strong>
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
              onClick={() => { setPaso("email"); setOtp(Array(modoPrivy ? 6 : 4).fill("")); }}
            >
              Cambiar correo
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
                El correo <strong>{email}</strong> no está registrado aún.
              </p>
            </div>
            <Link
              href={`/registro?email=${encodeURIComponent(email)}`}
              className="btn-primary"
            >
              Crear cuenta nueva →
            </Link>
            <button
              type="button"
              className="text-sm underline underline-offset-2"
              style={{ color: "var(--color-ink-soft)" }}
              onClick={() => { setPaso("email"); setOtp(Array(modoPrivy ? 6 : 4).fill("")); }}
            >
              Intentar con otro correo
            </button>
          </div>
        )}
      </div>

      {paso === "email" && (
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
