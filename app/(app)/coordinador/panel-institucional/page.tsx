"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";

function StatCard({
  valor,
  etiqueta,
  color = "primary",
}: {
  valor: number | string;
  etiqueta: string;
  color?: "primary" | "accent" | "success";
}) {
  const bg =
    color === "accent"
      ? "var(--color-accent-soft)"
      : color === "success"
      ? "var(--color-success-bg)"
      : "var(--color-primary-soft)";
  const text =
    color === "accent"
      ? "var(--color-accent-dark)"
      : color === "success"
      ? "var(--color-success)"
      : "var(--color-primary)";

  return (
    <div
      className="flex flex-1 flex-col items-center rounded-2xl py-6 px-3 text-center"
      style={{ background: bg }}
    >
      <span className="text-4xl font-extrabold leading-none" style={{ color: text }}>
        {valor}
      </span>
      <span className="mt-2 text-sm font-semibold leading-snug" style={{ color: text }}>
        {etiqueta}
      </span>
    </div>
  );
}

function descargarCSV(filas: [string, string][]) {
  const csv = filas
    .map((fila) => fila.map((valor) => `"${valor.replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `aguila-viajera-reporte-${new Date().toISOString().slice(0, 10)}.csv`;
  enlace.click();
  URL.revokeObjectURL(url);
}

export default function PanelInstitucionalPage() {
  const { currentUser, excursiones, usuarios, inscripciones } = useStore();

  const totalExcursiones = excursiones.length;

  const adultosMayoresActivos = useMemo(
    () =>
      usuarios.filter(
        (u) =>
          u.rol === "adulto_mayor" &&
          inscripciones.some((i) => i.usuarioId === u.id && i.estado !== "cancelada")
      ).length,
    [usuarios, inscripciones]
  );

  const { confirmadas, asistieron, tasaAsistencia } = useMemo(() => {
    const confirmadas = inscripciones.filter((i) => i.estado === "confirmada");
    const asistieron = confirmadas.filter((i) => i.asistenciaConfirmada).length;
    const tasaAsistencia =
      confirmadas.length > 0 ? Math.round((asistieron / confirmadas.length) * 100) : null;
    return { confirmadas, asistieron, tasaAsistencia };
  }, [inscripciones]);

  if (currentUser.rol !== "coordinador") {
    return (
      <div className="card text-center py-12" style={{ color: "var(--color-ink-soft)" }}>
        <p className="text-lg font-semibold">Esta sección es solo para coordinadores.</p>
      </div>
    );
  }

  const generadoEl = new Date().toLocaleString("es-MX", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div>
        <h1 className="text-3xl font-extrabold">Panel institucional</h1>
        <p className="text-base" style={{ color: "var(--color-ink-soft)" }}>
          Métricas agregadas de Águila Viajera para reportar a COPACO o al patrocinador.
        </p>
      </div>

      <div className="flex gap-3">
        <StatCard valor={totalExcursiones} etiqueta="excursiones creadas" color="primary" />
        <StatCard valor={adultosMayoresActivos} etiqueta="adultos mayores activos" color="success" />
        <StatCard
          valor={tasaAsistencia !== null ? `${tasaAsistencia}%` : "—"}
          etiqueta="tasa de asistencia"
          color="accent"
        />
      </div>

      <div className="info-box text-sm">
        Estos datos son agregados y anónimos — nunca se muestran nombres, perfiles de salud ni
        información médica individual en este panel. La tasa de asistencia se calcula sobre{" "}
        {confirmadas.length} inscripciones confirmadas ({asistieron} con asistencia registrada).
      </div>

      <div className="flex gap-3 no-print">
        <button
          className="btn-secondary flex-1"
          onClick={() =>
            descargarCSV([
              ["Métrica", "Valor"],
              ["Excursiones creadas", String(totalExcursiones)],
              ["Adultos mayores activos", String(adultosMayoresActivos)],
              ["Tasa de asistencia", tasaAsistencia !== null ? `${tasaAsistencia}%` : "Sin datos"],
            ])
          }
        >
          Exportar CSV
        </button>
        <button className="btn-secondary flex-1" onClick={() => window.print()}>
          Imprimir reporte
        </button>
      </div>

      <p className="text-xs text-center" style={{ color: "var(--color-ink-soft)" }}>
        Reporte generado el {generadoEl}
      </p>
    </div>
  );
}
