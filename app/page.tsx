"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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
      <p className="text-4xl font-extrabold" style={{ color: "var(--color-accent)" }}>
        {count.toLocaleString("es-MX")}
        {suffix}
      </p>
      <p className="mt-2 text-sm" style={{ color: "var(--color-ink-soft)" }}>
        {label}
      </p>
    </div>
  );
}

/* ── Small building blocks ──────────────────────────────── */

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden fill="none">
      <path
        d="M4 10.5 L8 14.5 L16 6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlaceholderImage({
  label = "Imagen",
  className = "",
  aspect = "aspect-[4/3]",
}: {
  label?: string;
  className?: string;
  aspect?: string;
}) {
  return (
    <div
      className={`placeholder-image ${aspect} ${className}`}
      role="img"
      aria-label="Espacio reservado para una imagen"
    >
      {label}
    </div>
  );
}

/* ── Landing sections ───────────────────────────────────── */

function TopBar() {
  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
        <span className="text-xl font-extrabold" style={{ color: "var(--color-primary)" }}>
          Águila Viajera
        </span>
        <div className="flex items-center gap-3">
          <span className="badge badge-accent hidden sm:inline-flex">Prototipo · COPACO</span>
          <Link href="/excursiones" className="btn-secondary text-sm px-4 py-2" style={{ minHeight: "40px" }}>
            Entrar a la app
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
      }}
    >
      <div
        className="orb animate-blob"
        style={{ width: 480, height: 480, top: -120, right: -100, background: "rgba(193,97,28,0.18)" }}
      />
      <div
        className="orb animate-blob delay-400"
        style={{ width: 320, height: 320, bottom: -80, left: -60, background: "rgba(255,255,255,0.07)" }}
      />

      <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-10 px-5 py-16 sm:flex-row sm:gap-14 sm:py-24">
        <div className="flex flex-1 flex-col gap-5 text-center sm:text-left">
          <span
            className="mx-auto w-fit rounded-full px-4 py-1.5 text-sm font-semibold sm:mx-0 animate-fade-in"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            COPACO · Iztapalapa, CDMX
          </span>

          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl animate-fade-up delay-100">
            Excursiones seguras para adultos mayores
          </h1>

          <p
            className="mx-auto max-w-md text-lg leading-relaxed sm:mx-0 animate-fade-up delay-200"
            style={{ color: "rgba(255,255,255,0.88)" }}
          >
            Registro de salud, inscripción y coordinación en un solo lugar — sin depender solo de
            WhatsApp.
          </p>

          <div className="mx-auto flex flex-col gap-3 sm:mx-0 sm:flex-row animate-fade-up delay-300">
            <Link href="/excursiones" className="btn-accent btn-glow text-lg">
              Ver próximas excursiones
            </Link>
            <Link href="/coordinador/nueva-excursion" className="btn-ghost-light text-lg">
              Soy coordinador COPACO
            </Link>
          </div>
        </div>

        <div className="w-full flex-1 animate-float">
          <PlaceholderImage label="Imagen de una excursión" aspect="aspect-[4/3]" className="max-w-sm mx-auto" />
        </div>
      </div>

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
      <div className="mx-auto max-w-5xl">
        <p
          className="reveal text-center text-sm font-semibold uppercase tracking-widest mb-8"
          style={{ color: "var(--color-accent)" }}
        >
          El problema que resolvemos
        </p>
        <div className="grid gap-6 sm:grid-cols-3">
          <StatCard valor={1850000} suffix="+" label="habitantes en Iztapalapa, ~30% adultos mayores" delay={0} />
          <StatCard valor={12000} suffix="+" label="voluntarios organizados en COPACO" delay={120} />
          <StatCard valor={750} suffix="+" label="muertes en 3 años por traslados mal gestionados" delay={240} />
        </div>
      </div>
    </section>
  );
}

/* ── Rotating image + description ───────────────────────── */

const MOMENTOS = [
  { titulo: "Salida puntual", detalle: "Cada excursión inicia con la lista de asistencia confirmada." },
  { titulo: "Rutas revisadas", detalle: "Verificamos la accesibilidad del camino antes de salir." },
  { titulo: "Acompañamiento", detalle: "Coordinadores atentos a las necesidades de cada persona." },
  { titulo: "Regreso seguro", detalle: "Cerramos cada excursión con el grupo completo." },
];

function MomentosCarousel() {
  const [activo, setActivo] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActivo((a) => (a + 1) % MOMENTOS.length), 4000);
    return () => clearInterval(id);
  }, []);

  const momento = MOMENTOS[activo];

  return (
    <section className="px-5 py-16" style={{ background: "var(--color-bg-alt)" }}>
      <div className="mx-auto max-w-5xl">
        <p
          className="reveal text-center text-sm font-semibold uppercase tracking-widest mb-8"
          style={{ color: "var(--color-accent)" }}
        >
          Así se ven nuestras excursiones
        </p>

        <div className="reveal flex flex-col items-center gap-8 sm:flex-row">
          <PlaceholderImage
            key={activo}
            label={`Imagen ${activo + 1} de ${MOMENTOS.length}`}
            aspect="aspect-[4/3]"
            className="max-w-sm animate-fade-in"
          />
          <div key={`text-${activo}`} className="flex-1 animate-fade-in">
            <h3 className="text-2xl font-extrabold">{momento.titulo}</h3>
            <p className="mt-2 text-lg" style={{ color: "var(--color-ink-soft)" }}>
              {momento.detalle}
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-2">
          {MOMENTOS.map((m, i) => (
            <button
              key={m.titulo}
              onClick={() => setActivo(i)}
              aria-label={`Mostrar: ${m.titulo}`}
              aria-current={i === activo}
              className="h-3 w-3 rounded-full transition-colors"
              style={{ background: i === activo ? "var(--color-primary)" : "var(--color-border)" }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ComoFunciona() {
  const pasos = [
    { titulo: "Te registras", detalle: "Con tu nombre y teléfono, solo o con ayuda de un familiar." },
    { titulo: "Completas tu perfil de salud", detalle: "Movilidad, medicamentos y contacto de emergencia." },
    { titulo: "Te inscribes a una excursión", detalle: "Te avisamos si la ruta no es apta para ti." },
    { titulo: "Viajas con respaldo", detalle: "El coordinador conoce tus necesidades." },
  ];

  return (
    <section className="px-5 py-16" style={{ background: "var(--color-bg)" }}>
      <div className="mx-auto max-w-5xl">
        <h2 className="reveal text-center text-3xl font-extrabold">Cómo funciona</h2>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {pasos.map((paso, i) => (
            <div key={paso.titulo} className="reveal card flex gap-4" style={{ transitionDelay: `${i * 80}ms` }}>
              <span className="step-number">{i + 1}</span>
              <div>
                <p className="font-bold">{paso.titulo}</p>
                <p className="mt-1" style={{ color: "var(--color-ink-soft)" }}>
                  {paso.detalle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DestinosCards({
  excursiones,
}: {
  excursiones: ReturnType<typeof useStore>["excursiones"];
}) {
  return (
    <section className="px-5 py-16" style={{ background: "var(--color-bg-alt)" }}>
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-8">
          <h2 className="reveal text-3xl font-extrabold">Destinos COPACO</h2>
          <Link href="/excursiones" className="reveal font-bold underline" style={{ color: "var(--color-primary)" }}>
            Ver todas
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {excursiones.map((ex, i) => (
            <Link
              key={ex.id}
              href={`/excursiones/${ex.id}`}
              className="reveal card card-interactive flex flex-col gap-3"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <PlaceholderImage label={ex.destino} aspect="aspect-[4/3]" />
              <h3 className="text-lg font-extrabold">{ex.destino}</h3>
              <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
                {ex.descripcionLarga}
              </p>
              <AccesibilidadBadge excursion={ex} icon={false} />
            </Link>
          ))}
          {excursiones.length === 0 && (
            <p style={{ color: "var(--color-ink-soft)" }}>Aún no hay destinos publicados.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function Garantias() {
  const puntos = [
    { titulo: "Pensado para adultos mayores", detalle: "Tipografía grande, alto contraste, botones amplios." },
    { titulo: "El familiar apoya, no reemplaza", detalle: "El adulto mayor puede hacer todo por sí mismo." },
    { titulo: "Datos de salud protegidos", detalle: "Visibles solo para quien debe verlos." },
    { titulo: "Registro con autoría verificable", detalle: "Cada excursión queda registrada, sin borrados." },
  ];

  return (
    <section className="px-5 py-16" style={{ background: "var(--color-bg)" }}>
      <div className="mx-auto max-w-5xl">
        <h2 className="reveal text-center text-3xl font-extrabold">Diseñado con COPACO</h2>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {puntos.map((p, i) => (
            <div key={p.titulo} className="reveal flex gap-3" style={{ transitionDelay: `${i * 70}ms` }}>
              <span
                className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full"
                style={{ background: "var(--color-accent)" }}
                aria-hidden
              />
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
  const items = [
    "Wizard de creación en 4 pasos",
    "Lista de participantes con datos de salud",
    "Check-in de asistencia por participante",
  ];

  return (
    <section
      className="px-5 py-16"
      style={{ background: "linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))" }}
    >
      <div className="mx-auto max-w-5xl flex flex-col items-center gap-10 sm:flex-row">
        <div className="reveal-left w-full flex-1">
          <PlaceholderImage label="Imagen del panel de coordinador" aspect="aspect-[4/3]" />
        </div>

        <div className="reveal-right flex-1 text-white flex flex-col gap-4">
          <h2 className="text-3xl font-extrabold">Para coordinadores COPACO</h2>
          <p style={{ color: "rgba(255,255,255,0.85)" }}>
            Crea una excursión, revisa el perfil médico de cada participante y lleva el check-in
            desde tu celular.
          </p>
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.9)" }}>
                <span style={{ color: "var(--color-accent)" }}>
                  <CheckIcon />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Link href="/coordinador/nueva-excursion" className="btn-accent btn-glow">
              Crear nueva excursión
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
    <footer className="px-5 py-10" style={{ background: "var(--color-primary-dark)", color: "white" }}>
      <div className="mx-auto max-w-5xl flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2 max-w-sm">
          <p className="text-xl font-extrabold">Águila Viajera</p>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
            Proyecto comunitario digital para COPACO, Iztapalapa · Prototipo de demostración.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {[
            { label: "Excursiones", href: "/excursiones" },
            { label: "Mi perfil de salud", href: "/perfil-salud" },
            { label: "Nueva excursión", href: "/coordinador/nueva-excursion" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="text-sm hover:underline" style={{ color: "rgba(255,255,255,0.8)" }}>
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ── Root page ──────────────────────────────────────────── */

export default function LandingPage() {
  const { excursiones } = useStore();
  useReveal();

  const destinos = useMemo(
    () => excursiones.filter((e) => e.estado === "publicada").slice(0, 3),
    [excursiones]
  );

  return (
    <div className="flex flex-1 flex-col">
      <TopBar />
      <Hero />
      <ImpactStats />
      <MomentosCarousel />
      <ComoFunciona />
      <DestinosCards excursiones={destinos} />
      <Garantias />
      <CoordinadorCTA />
      <Footer />
    </div>
  );
}
