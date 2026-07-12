"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { AccesibilidadBadge } from "@/components/AccesibilidadIcon";

/* ── Scroll-reveal hook ─────────────────────────────────── */

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal, .reveal-left, .reveal-right");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ── Animated counter ───────────────────────────────────── */

function useCounter(target: number, duration = 1800, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration, start]);
  return value;
}

/* ── Stat card with animated counter ───────────────────── */

function StatCard({ valor, label, suffix = "", delay = 0 }: { valor: number; label: string; suffix?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const count = useCounter(valor, 1600, started);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setStarted(true); io.disconnect(); } },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="card text-center reveal"
      style={{ animationDelay: `${delay}ms`, transitionDelay: `${delay}ms` }}
    >
      <p
        className="text-4xl font-extrabold"
        style={{ color: "var(--color-accent)" }}
      >
        {count.toLocaleString("es-MX")}
        {suffix}
      </p>
      <p className="mt-2 text-sm" style={{ color: "var(--color-ink-soft)" }}>
        {label}
      </p>
    </div>
  );
}

/* ── SVG Illustrations ──────────────────────────────────── */

function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 420 380"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="w-full max-w-sm animate-float"
      style={{ filter: "drop-shadow(0 24px 48px rgba(0,0,0,0.25))" }}
    >
      {/* Background blob */}
      <ellipse cx="210" cy="200" rx="185" ry="165" fill="rgba(255,255,255,0.08)" />

      {/* Phone frame */}
      <rect x="120" y="40" width="180" height="310" rx="22" fill="white" opacity="0.97" />
      <rect x="128" y="50" width="164" height="290" rx="16" fill="#f2ede1" />

      {/* Status bar */}
      <rect x="128" y="50" width="164" height="24" rx="16" fill="#0d6b4f" />
      <circle cx="210" cy="62" r="4" fill="rgba(255,255,255,0.4)" />

      {/* App header */}
      <rect x="128" y="74" width="164" height="36" fill="#0d6b4f" />
      <text x="148" y="97" fontSize="11" fontWeight="bold" fill="white">🦅 Águila Viajera</text>

      {/* Excursion card 1 */}
      <rect x="138" y="120" width="144" height="64" rx="10" fill="white" />
      <rect x="138" y="120" width="144" height="64" rx="10" stroke="#e1dbc9" strokeWidth="1" />
      <text x="152" y="140" fontSize="18">🏔️</text>
      <text x="178" y="140" fontSize="9" fontWeight="bold" fill="#201d16">Ajusco</text>
      <text x="178" y="153" fontSize="8" fill="#5c574a">15 jul · Iztapalapa</text>
      <rect x="178" y="158" width="50" height="12" rx="6" fill="#eaf6f0" />
      <text x="183" y="167" fontSize="7" fill="#0d6b4f" fontWeight="600">Accesible ✓</text>

      {/* Excursion card 2 */}
      <rect x="138" y="194" width="144" height="64" rx="10" fill="white" />
      <rect x="138" y="194" width="144" height="64" rx="10" stroke="#e1dbc9" strokeWidth="1" />
      <text x="152" y="214" fontSize="18">🌊</text>
      <text x="178" y="214" fontSize="9" fontWeight="bold" fill="#201d16">Xochimilco</text>
      <text x="178" y="227" fontSize="8" fill="#5c574a">22 jul · Iztapalapa</text>
      <rect x="178" y="232" width="60" height="12" rx="6" fill="#fbead9" />
      <text x="183" y="241" fontSize="7" fill="#c1611c" fontWeight="600">Acompañante</text>

      {/* Bottom CTA button */}
      <rect x="148" y="270" width="124" height="32" rx="10" fill="#c1611c" />
      <text x="168" y="290" fontSize="9" fontWeight="bold" fill="white">Ver excursiones →</text>

      {/* Floating badge — health check */}
      <g style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.2))" }}>
        <rect x="52" y="100" width="84" height="52" rx="12" fill="white" />
        <text x="62" y="120" fontSize="16">🩺</text>
        <text x="82" y="120" fontSize="8" fontWeight="bold" fill="#201d16">Perfil</text>
        <text x="82" y="131" fontSize="8" fill="#201d16">de salud</text>
        <rect x="62" y="138" width="64" height="6" rx="3" fill="#eaf6f0" />
        <rect x="62" y="138" width="44" height="6" rx="3" fill="#0d6b4f" />
      </g>

      {/* Floating badge — coordinator check */}
      <g style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.2))" }}>
        <rect x="288" y="180" width="90" height="52" rx="12" fill="white" />
        <text x="298" y="200" fontSize="16">✅</text>
        <text x="320" y="200" fontSize="8" fontWeight="bold" fill="#201d16">Check-in</text>
        <text x="320" y="211" fontSize="8" fill="#201d16">confirmado</text>
        <text x="298" y="224" fontSize="8" fill="#0d6b4f" fontWeight="700">12 / 15 viajeros</text>
      </g>

      {/* Floating badge — alert */}
      <g style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.2))" }}>
        <rect x="60" y="270" width="80" height="42" rx="12" fill="white" />
        <text x="70" y="292" fontSize="9" fontWeight="bold" fill="#b3401b">⚠️ Aviso</text>
        <text x="70" y="304" fontSize="7" fill="#5c574a">Ruta con</text>
        <text x="70" y="314" fontSize="7" fill="#5c574a">escalones</text>
      </g>
    </svg>
  );
}

function CoordinatorIllustration() {
  return (
    <svg viewBox="0 0 340 260" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className="w-full max-w-xs">
      {/* Clipboard */}
      <rect x="60" y="20" width="220" height="220" rx="16" fill="white" stroke="#e1dbc9" strokeWidth="2" />
      <rect x="120" y="10" width="100" height="24" rx="8" fill="#0d6b4f" />

      {/* Title row */}
      <text x="80" y="65" fontSize="11" fontWeight="bold" fill="#201d16">Lista de participantes</text>
      <rect x="80" y="72" width="140" height="1" fill="#e1dbc9" />

      {/* Participant rows */}
      {[
        { name: "Elena Martínez", check: true, y: 90 },
        { name: "Roberto Sánchez", check: true, y: 112 },
        { name: "María López", check: false, y: 134 },
        { name: "José Pérez", check: true, y: 156 },
        { name: "Carmen Ruiz", check: false, y: 178 },
      ].map((p) => (
        <g key={p.name}>
          <circle cx="94" cy={p.y + 3} r="8" fill={p.check ? "#eaf6f0" : "#f2ede1"} />
          {p.check && <text x="89" y={p.y + 8} fontSize="9" fill="#0d6b4f">✓</text>}
          <text x="110" y={p.y + 8} fontSize="9" fill="#201d16">{p.name}</text>
          <rect x="80" y={p.y + 16} width="180" height="1" fill="#f2ede1" />
        </g>
      ))}

      {/* Progress bar */}
      <rect x="80" y="202" width="180" height="12" rx="6" fill="#f2ede1" />
      <rect x="80" y="202" width="108" height="12" rx="6" fill="#0d6b4f" />
      <text x="90" y="213" fontSize="8" fill="white" fontWeight="bold">3 / 5 check-in</text>
    </svg>
  );
}

function FamilyIllustration() {
  return (
    <svg viewBox="0 0 300 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className="w-full max-w-xs mx-auto">
      {/* Connection arc */}
      <path d="M 80 120 Q 150 60 220 120" stroke="#0d6b4f" strokeWidth="2.5" strokeDasharray="6 4" fill="none" opacity="0.5" />

      {/* Elder person */}
      <circle cx="75" cy="120" r="38" fill="#eaf6f0" />
      <text x="57" y="130" fontSize="32">👴</text>
      <rect x="45" y="165" width="60" height="18" rx="9" fill="#0d6b4f" />
      <text x="55" y="178" fontSize="8" fill="white" fontWeight="bold">Adulto mayor</text>

      {/* Family person */}
      <circle cx="225" cy="120" r="38" fill="#fbead9" />
      <text x="207" y="130" fontSize="32">👩</text>
      <rect x="195" y="165" width="60" height="18" rx="9" fill="#c1611c" />
      <text x="205" y="178" fontSize="8" fill="white" fontWeight="bold">Familiar</text>

      {/* Center icon */}
      <circle cx="150" cy="90" r="18" fill="white" stroke="#0d6b4f" strokeWidth="2" />
      <text x="141" y="98" fontSize="16">🔗</text>

      {/* Labels */}
      <text x="88" y="215" fontSize="8" fill="#5c574a" textAnchor="middle">Inscripción autónoma</text>
      <text x="212" y="215" fontSize="8" fill="#5c574a" textAnchor="middle">Apoyo cuando se necesita</text>
    </svg>
  );
}

/* ── Landing sections ───────────────────────────────────── */

function TopBar() {
  return (
    <nav
      className="sticky top-0 z-50 border-b backdrop-blur-md"
      style={{
        borderColor: "var(--color-border)",
        background: "rgba(250, 248, 243, 0.88)",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <span
          className="flex items-center gap-2 text-xl font-extrabold"
          style={{ color: "var(--color-primary)" }}
        >
          <span aria-hidden className="text-2xl">🦅</span>
          Águila Viajera
        </span>
        <div className="flex items-center gap-3">
          <span className="badge badge-accent hidden sm:inline-flex">
            Prototipo · COPACO
          </span>
          <Link href="/excursiones" className="btn-secondary text-sm px-4 py-2" style={{ minHeight: "40px" }}>
            Entrar a la app →
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: "linear-gradient(150deg, #08402f 0%, #0d6b4f 55%, #0f7a5a 100%)",
        color: "white",
        minHeight: "88vh",
      }}
    >
      {/* Background orbs */}
      <div
        className="orb animate-blob"
        style={{
          width: 480,
          height: 480,
          top: -120,
          right: -100,
          background: "rgba(193,97,28,0.18)",
        }}
      />
      <div
        className="orb animate-blob delay-400"
        style={{
          width: 320,
          height: 320,
          bottom: -80,
          left: -60,
          background: "rgba(255,255,255,0.07)",
        }}
      />

      {/* Grid decoration */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          pointerEvents: "none",
        }}
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-5 py-20 sm:flex-row sm:gap-16 sm:py-28">
        {/* Text block */}
        <div className="flex flex-1 flex-col gap-6 text-center sm:text-left">
          <span
            className="mx-auto w-fit rounded-full px-4 py-1.5 text-sm font-semibold sm:mx-0 animate-fade-in"
            style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}
          >
            🏙️ COPACO · Iztapalapa, CDMX
          </span>

          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl animate-fade-up delay-100">
            Excursiones seguras para{" "}
            <span className="text-shimmer">adultos mayores</span>,{" "}
            sin depender solo de WhatsApp
          </h1>

          <p
            className="mx-auto max-w-xl text-lg leading-relaxed sm:mx-0 animate-fade-up delay-200"
            style={{ color: "rgba(255,255,255,0.88)" }}
          >
            Águila Viajera digitaliza el trabajo voluntario de COPACO: registro de salud,
            inscripción inteligente a excursiones y coordinación con trazabilidad — para que
            ningún traslado se organice a ciegas.
          </p>

          <div className="mx-auto flex flex-col gap-3 sm:mx-0 sm:flex-row animate-fade-up delay-300">
            <Link href="/excursiones" className="btn-accent btn-glow text-lg">
              Ver próximas excursiones 🗺️
            </Link>
            <Link href="/coordinador/nueva-excursion" className="btn-ghost-light text-lg">
              Soy coordinador COPACO
            </Link>
          </div>

          {/* Social proof strip */}
          <div
            className="mx-auto flex flex-wrap items-center gap-4 rounded-2xl px-5 py-3 sm:mx-0 animate-fade-up delay-400"
            style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(6px)" }}
          >
            {[
              { icon: "👴", text: "Diseño accesible 18px+" },
              { icon: "🔒", text: "Datos de salud protegidos" },
              { icon: "✅", text: "Sin WhatsApp" },
            ].map((item) => (
              <span key={item.text} className="flex items-center gap-2 text-sm text-white/90">
                <span aria-hidden>{item.icon}</span> {item.text}
              </span>
            ))}
          </div>
        </div>

        {/* Illustration */}
        <div className="flex-1 flex justify-center sm:justify-end">
          <HeroIllustration />
        </div>
      </div>

      {/* Wave divider */}
      <div style={{ marginBottom: -2 }}>
        <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%" }}>
          <path d="M0,40 C360,90 1080,-10 1440,40 L1440,80 L0,80 Z" fill="var(--color-bg)" />
        </svg>
      </div>
    </section>
  );
}

function ImpactStats() {
  return (
    <section className="px-5 py-16" style={{ background: "var(--color-bg)" }}>
      <div className="mx-auto max-w-6xl">
        <p className="reveal text-center text-sm font-semibold uppercase tracking-widest mb-8" style={{ color: "var(--color-accent)" }}>
          El problema que resolvemos
        </p>
        <div className="grid gap-6 sm:grid-cols-3">
          <StatCard
            valor={1850000}
            suffix="+"
            label="habitantes en Iztapalapa, ~30% adultos mayores"
            delay={0}
          />
          <StatCard
            valor={12000}
            suffix="+"
            label="ciudadanos organizados como voluntarios COPACO"
            delay={120}
          />
          <StatCard
            valor={750}
            suffix="+"
            label="muertes en 3 años por traslados mal gestionados"
            delay={240}
          />
        </div>
        <p className="reveal mx-auto mt-8 max-w-3xl text-center" style={{ color: "var(--color-ink-soft)" }}>
          Sin registro de salud ni control de aforo, cada excursión coordinada por WhatsApp es una
          apuesta. Águila Viajera resuelve eso desde el diseño.
        </p>
      </div>
    </section>
  );
}

function ComoFunciona() {
  const pasos = [
    {
      titulo: "Te registras sin complicaciones",
      detalle: "Con tu nombre y teléfono. Tú solo(a), o con ayuda de un familiar vinculado.",
      emoji: "📝",
      color: "var(--color-primary-soft)",
      iconColor: "var(--color-primary)",
    },
    {
      titulo: "Completas tu perfil de salud",
      detalle: "Movilidad, condiciones, medicamentos y contacto de emergencia — siempre editable.",
      emoji: "🩺",
      color: "#ede9fe",
      iconColor: "#7c3aed",
    },
    {
      titulo: "Te inscribes a una excursión",
      detalle: "Si la ruta tiene obstáculos para tu movilidad, te avisamos antes de confirmar.",
      emoji: "🗺️",
      color: "var(--color-accent-soft)",
      iconColor: "var(--color-accent)",
    },
    {
      titulo: "Viajas con respaldo",
      detalle: "El coordinador COPACO conoce tus necesidades y lleva el control del grupo.",
      emoji: "🚌",
      color: "#fef9c3",
      iconColor: "#a16207",
    },
  ];

  return (
    <section className="px-5 py-20" style={{ background: "var(--color-bg-alt)" }}>
      <div className="mx-auto max-w-6xl">
        <p className="reveal text-center text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-accent)" }}>
          Cómo funciona
        </p>
        <h2 className="reveal text-center text-3xl font-extrabold sm:text-4xl">
          Pensado para que un adulto mayor lo use solo
        </h2>
        <p className="reveal mx-auto mt-3 max-w-xl text-center" style={{ color: "var(--color-ink-soft)" }}>
          Con ayuda de un familiar cuando la necesite, nunca como obligación.
        </p>

        {/* Steps grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {pasos.map((paso, i) => (
            <div
              key={paso.titulo}
              className="reveal card flex gap-4 card-interactive"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="flex flex-col items-center gap-2">
                <span
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-2xl"
                  style={{ background: paso.color }}
                  aria-hidden
                >
                  {paso.emoji}
                </span>
                {i < pasos.length - 1 && (
                  <div className="w-0.5 flex-1 min-h-4" style={{ background: "var(--color-border)" }} />
                )}
              </div>
              <div className="pb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white"
                    style={{ background: paso.iconColor }}
                  >
                    {i + 1}
                  </span>
                  <p className="font-bold">{paso.titulo}</p>
                </div>
                <p className="mt-1 ml-8" style={{ color: "var(--color-ink-soft)" }}>
                  {paso.detalle}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="reveal mt-10 flex justify-center">
          <Link href="/perfil-salud" className="btn-primary btn-glow text-lg">
            Crear mi perfil de salud →
          </Link>
        </div>
      </div>
    </section>
  );
}

function ParaQuienEs() {
  const perfiles = [
    {
      ilustracion: (
        <svg viewBox="0 0 80 80" className="w-16 h-16" aria-hidden>
          <circle cx="40" cy="40" r="38" fill="#eaf6f0" />
          <text x="18" y="55" fontSize="42">👴</text>
        </svg>
      ),
      titulo: "Adulto mayor",
      descripcion:
        "Puede inscribirse solo, ver sus excursiones y actualizar su perfil de salud sin ayuda de nadie.",
      accion: "Ver excursiones",
      href: "/excursiones",
      color: "var(--color-primary)",
    },
    {
      ilustracion: (
        <svg viewBox="0 0 80 80" className="w-16 h-16" aria-hidden>
          <circle cx="40" cy="40" r="38" fill="#fbead9" />
          <text x="18" y="55" fontSize="42">👩</text>
        </svg>
      ),
      titulo: "Familiar / cuidador",
      descripcion:
        "Puede vincularse con su familiar mayor para ayudarle a gestionar su perfil y ver sus inscripciones.",
      accion: "Ver perfil de salud",
      href: "/perfil-salud",
      color: "var(--color-accent)",
    },
    {
      ilustracion: (
        <svg viewBox="0 0 80 80" className="w-16 h-16" aria-hidden>
          <circle cx="40" cy="40" r="38" fill="#ede9fe" />
          <text x="18" y="55" fontSize="42">📋</text>
        </svg>
      ),
      titulo: "Coordinador COPACO",
      descripcion:
        "Crea excursiones, revisa el perfil médico de participantes y lleva el control de asistencia digital.",
      accion: "Nueva excursión",
      href: "/coordinador/nueva-excursion",
      color: "#7c3aed",
    },
  ];

  return (
    <section className="px-5 py-20">
      <div className="mx-auto max-w-6xl">
        <p className="reveal text-center text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-accent)" }}>
          ¿Para quién es?
        </p>
        <h2 className="reveal text-center text-3xl font-extrabold sm:text-4xl">
          Tres roles, una sola plataforma
        </h2>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {perfiles.map((p, i) => (
            <div
              key={p.titulo}
              className="reveal card card-gradient-border flex flex-col items-center gap-4 text-center"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="animate-float" style={{ animationDelay: `${i * 1.5}s` }}>
                {p.ilustracion}
              </div>
              <h3 className="text-xl font-extrabold">{p.titulo}</h3>
              <p style={{ color: "var(--color-ink-soft)" }}>{p.descripcion}</p>
              <Link
                href={p.href}
                className="mt-auto btn-secondary text-sm"
                style={{
                  color: p.color,
                  borderColor: p.color,
                  minHeight: "44px",
                  padding: "0.6rem 1.25rem",
                }}
              >
                {p.accion} →
              </Link>
            </div>
          ))}
        </div>

        {/* Illustration */}
        <div className="reveal mt-16 flex flex-col sm:flex-row items-center gap-8 rounded-3xl p-8" style={{ background: "var(--color-bg-alt)" }}>
          <div className="flex-1">
            <FamilyIllustration />
          </div>
          <div className="flex-1 flex flex-col gap-4">
            <h3 className="text-2xl font-extrabold">El familiar apoya, no reemplaza</h3>
            <p style={{ color: "var(--color-ink-soft)" }}>
              El adulto mayor siempre es el protagonista. El familiar vinculado puede ayudarle a
              completar su perfil de salud o inscribirse a una excursión — pero el adulto mayor
              puede hacer todo eso por sí mismo desde el primer día.
            </p>
            <ul className="flex flex-col gap-2">
              {[
                "Inscripción autónoma desde el celular",
                "Familiar puede ver y editar el perfil de salud",
                "El coordinador ve los datos médicos solo de su excursión",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <span style={{ color: "var(--color-primary)" }} className="mt-0.5 flex-shrink-0">✔</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProximasExcursiones({
  excursiones,
  usuarios,
}: {
  excursiones: ReturnType<typeof useStore>["excursiones"];
  usuarios: ReturnType<typeof useStore>["usuarios"];
}) {
  return (
    <section className="px-5 py-20" style={{ background: "var(--color-bg-alt)" }}>
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-10">
          <div>
            <p className="reveal text-sm font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--color-accent)" }}>
              Agenda actual
            </p>
            <h2 className="reveal text-3xl font-extrabold sm:text-4xl">Próximas excursiones</h2>
            <p className="reveal mt-1" style={{ color: "var(--color-ink-soft)" }}>
              Organizadas por comisiones COPACO en Iztapalapa.
            </p>
          </div>
          <Link
            href="/excursiones"
            className="reveal font-bold underline text-lg"
            style={{ color: "var(--color-primary)" }}
          >
            Ver todas →
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {excursiones.map((ex, i) => {
            const coordinador = usuarios.find((u) => u.id === ex.coordinadorId);
            return (
              <Link
                key={ex.id}
                href={`/excursiones/${ex.id}`}
                className="reveal card card-interactive flex flex-col gap-3"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl"
                    style={{ background: "var(--color-primary-soft)" }}
                    aria-hidden
                  >
                    {ex.imagenEmoji}
                  </span>
                  <AccesibilidadBadge excursion={ex} />
                </div>
                <h3 className="text-lg font-extrabold">{ex.destino}</h3>
                <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
                  📅 {formatFecha(ex.fecha)} · 📍 {ex.colonia}
                </p>
                <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
                  👤 Coordina: {coordinador?.nombre}
                </p>
                <div
                  className="mt-auto flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold"
                  style={{ background: "var(--color-primary-soft)", color: "var(--color-primary)" }}
                >
                  <span>Ver detalles</span>
                  <span>→</span>
                </div>
              </Link>
            );
          })}
          {excursiones.length === 0 && (
            <p style={{ color: "var(--color-ink-soft)" }}>Aún no hay excursiones publicadas.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function Garantias() {
  const puntos = [
    {
      emoji: "🔤",
      titulo: "Pensado para adultos mayores",
      detalle: "Tipografía de 18px mínimo, alto contraste, botones de al menos 48px y sin jerga técnica.",
      bg: "var(--color-primary-soft)",
    },
    {
      emoji: "👪",
      titulo: "El familiar apoya, no reemplaza",
      detalle: "El adulto mayor puede hacer todo solo; el familiar vinculado es apoyo opcional, nunca obligatorio.",
      bg: "var(--color-accent-soft)",
    },
    {
      emoji: "🔒",
      titulo: "Datos de salud protegidos",
      detalle: "Visibles solo para el usuario, su familiar vinculado y el coordinador asignado a su excursión.",
      bg: "#ede9fe",
    },
    {
      emoji: "🧾",
      titulo: "Registro con autoría verificable",
      detalle: "Cada excursión queda registrada con autor y fecha — sin borrados ni modificaciones de terceros.",
      bg: "#fef9c3",
    },
    {
      emoji: "♿",
      titulo: "Alertas de accesibilidad",
      detalle: "Si tu perfil de movilidad choca con los obstáculos de una ruta, te avisamos antes de inscribirte.",
      bg: "var(--color-primary-soft)",
    },
    {
      emoji: "🚫",
      titulo: "Sin WhatsApp, sin caos",
      detalle: "Las inscripciones, listas y asistencias quedan en la plataforma, no en 20 chats distintos.",
      bg: "var(--color-accent-soft)",
    },
  ];

  return (
    <section className="px-5 py-20">
      <div className="mx-auto max-w-6xl">
        <p className="reveal text-center text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-accent)" }}>
          Por qué confiar
        </p>
        <h2 className="reveal text-center text-3xl font-extrabold sm:text-4xl">
          Diseñado con COPACO, no solo para COPACO
        </h2>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {puntos.map((p, i) => (
            <div
              key={p.titulo}
              className="reveal card card-interactive flex gap-4"
              style={{ transitionDelay: `${i * 70}ms` }}
            >
              <span
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-2xl"
                style={{ background: p.bg }}
                aria-hidden
              >
                {p.emoji}
              </span>
              <div>
                <p className="font-bold">{p.titulo}</p>
                <p className="mt-1 text-sm" style={{ color: "var(--color-ink-soft)" }}>
                  {p.detalle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CoordinadorCTA() {
  return (
    <section
      className="px-5 py-20 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))" }}
    >
      {/* Decorative dots */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          pointerEvents: "none",
        }}
      />

      <div className="relative mx-auto max-w-6xl flex flex-col sm:flex-row items-center gap-10">
        {/* Coordinator illustration */}
        <div className="reveal-left flex-1">
          <CoordinatorIllustration />
        </div>

        {/* Text */}
        <div className="reveal-right flex-1 text-white flex flex-col gap-5">
          <span className="w-fit rounded-full px-4 py-1.5 text-sm font-semibold" style={{ background: "rgba(255,255,255,0.15)" }}>
            Para coordinadores COPACO
          </span>
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Deja de gestionar excursiones con hojas de papel
          </h2>
          <p style={{ color: "rgba(255,255,255,0.85)" }}>
            Crea una excursión en 4 pasos, revisa el perfil médico de cada participante antes de salir
            y lleva el check-in de asistencia desde tu celular — todo con trazabilidad y sin WhatsApp.
          </p>
          <ul className="flex flex-col gap-2">
            {[
              "Wizard de creación en 4 pasos",
              "Lista de participantes con datos de salud",
              "Check-in de asistencia por participante",
              "Alertas automáticas de accesibilidad",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.9)" }}>
                <span style={{ color: "var(--color-accent)" }}>✔</span> {item}
              </li>
            ))}
          </ul>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Link href="/coordinador/nueva-excursion" className="btn-accent btn-glow">
              Crear nueva excursión →
            </Link>
            <Link href="/excursiones" className="btn-ghost-light">
              Ver panel de excursiones
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer
      className="px-5 py-12"
      style={{ background: "var(--color-primary-dark)", color: "white" }}
    >
      <div className="mx-auto max-w-6xl flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        {/* Brand */}
        <div className="flex flex-col gap-2 max-w-sm">
          <p className="text-xl font-extrabold">🦅 Águila Viajera</p>
          <p style={{ color: "rgba(255,255,255,0.7)" }}>
            Proyecto comunitario digital para COPACO — Iztapalapa, Ciudad de México.
          </p>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            Prototipo de demostración · sin datos reales.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-2">
          <p className="font-semibold text-sm uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.5)" }}>
            Explorar
          </p>
          {[
            { label: "Excursiones", href: "/excursiones" },
            { label: "Mi perfil de salud", href: "/perfil-salud" },
            { label: "Nueva excursión (coordinador)", href: "/coordinador/nueva-excursion" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm hover:underline"
              style={{ color: "rgba(255,255,255,0.8)" }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Badge */}
        <div className="flex flex-col gap-2 items-start sm:items-end">
          <span className="badge badge-accent">Prototipo · Fase -1</span>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            Validación UX con usuarios reales
          </p>
        </div>
      </div>

      <div
        className="mx-auto mt-10 max-w-6xl border-t pt-6 text-center text-sm"
        style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}
      >
        Águila Viajera © 2025 — hecho con ♥ para las abuelas y abuelos de Iztapalapa
      </div>
    </footer>
  );
}

/* ── Root page ──────────────────────────────────────────── */

export default function LandingPage() {
  const { excursiones, usuarios } = useStore();
  useReveal();

  const proximas = useMemo(
    () =>
      excursiones
        .filter((e) => e.estado === "publicada")
        .sort((a, b) => a.fecha.localeCompare(b.fecha))
        .slice(0, 3),
    [excursiones]
  );

  return (
    <div className="flex flex-1 flex-col">
      <TopBar />
      <Hero />
      <ImpactStats />
      <ComoFunciona />
      <ParaQuienEs />
      <ProximasExcursiones excursiones={proximas} usuarios={usuarios} />
      <Garantias />
      <CoordinadorCTA />
      <Footer />
    </div>
  );
}

function formatFecha(fecha: string) {
  const d = new Date(fecha + "T12:00:00");
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "long" });
}
