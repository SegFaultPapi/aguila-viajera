import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-bg)" }}>
      <nav
        className="border-b bg-white px-5 py-4"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-extrabold"
            style={{ color: "var(--color-primary)" }}
          >
            <span aria-hidden>🦅</span> Águila Viajera
          </Link>
          <span className="badge badge-accent hidden sm:inline-flex">Prototipo · COPACO</span>
        </div>
      </nav>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        {children}
      </main>
      <footer
        className="py-5 text-center text-sm"
        style={{ color: "var(--color-ink-soft)" }}
      >
        Águila Viajera — COPACO Iztapalapa, CDMX &nbsp;·&nbsp;{" "}
        <span className="opacity-60">Prototipo sin datos reales</span>
      </footer>
    </div>
  );
}
