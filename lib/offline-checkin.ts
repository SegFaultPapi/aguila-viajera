"use client";

/**
 * Cola de check-ins en localStorage para el panel de participantes (B3).
 * El store en memoria (lib/store.tsx) se pierde en cada recarga; esta cola
 * sobrevive recargas y cortes de conexión para que el coordinador no pierda
 * asistencia tomada en campo sin señal (PRD §4.6).
 */

export interface CheckinPendiente {
  inscripcionId: string;
  excursionId: string;
  asistio: boolean;
  timestamp: string;
  sincronizado: boolean;
}

const STORAGE_KEY = "aguila-viajera:checkins-offline";

function leerCola(): CheckinPendiente[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CheckinPendiente[]) : [];
  } catch {
    return [];
  }
}

function guardarCola(cola: CheckinPendiente[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cola));
}

export function registrarCheckinLocal(
  inscripcionId: string,
  excursionId: string,
  asistio: boolean,
  sincronizado: boolean
): CheckinPendiente {
  const cola = leerCola();
  const entrada: CheckinPendiente = {
    inscripcionId,
    excursionId,
    asistio,
    timestamp: new Date().toISOString(),
    sincronizado,
  };
  const idx = cola.findIndex((c) => c.inscripcionId === inscripcionId);
  if (idx >= 0) cola[idx] = entrada;
  else cola.push(entrada);
  guardarCola(cola);
  return entrada;
}

export function checkinsDeExcursion(excursionId: string): CheckinPendiente[] {
  return leerCola().filter((c) => c.excursionId === excursionId);
}

export function marcarSincronizados(excursionId: string) {
  const cola = leerCola().map((c) =>
    c.excursionId === excursionId ? { ...c, sincronizado: true } : c
  );
  guardarCola(cola);
}
