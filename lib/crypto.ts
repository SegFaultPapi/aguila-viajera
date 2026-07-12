/**
 * Utilidades criptográficas para la Épica C (integridad de registros).
 *
 * Usa la Web Crypto API nativa del navegador — sin dependencias externas.
 * En producción (backend NestJS) se usará el módulo `node:crypto` con la
 * misma función SHA-256 para garantizar determinismo cross-platform.
 */

/**
 * Calcula el hash SHA-256 de un string y lo devuelve como hex de 64 caracteres.
 * Se usa para generar el contentHash de excursiones, inscripciones y check-ins.
 */
export async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Serializa un objeto en JSON canónico (claves ordenadas alfabéticamente)
 * antes de hashearlo. Esto garantiza que el mismo objeto produce siempre
 * el mismo hash independientemente del orden de inserción de propiedades.
 */
export function canonicalJSON(obj: unknown): string {
  return JSON.stringify(obj, Object.keys(obj as object).sort());
}

/**
 * Hash SHA-256 de un objeto serializado en JSON canónico.
 * Este es el punto de entrada principal para hashear registros.
 */
export async function hashObjeto(obj: unknown): Promise<string> {
  return sha256Hex(canonicalJSON(obj));
}

/**
 * Produce el "contenido canónico" de una excursión para hashear.
 * Excluye campos mutables post-creación (historial, eventLog, anclajeBlockchain)
 * para que el hash refleje solo los datos inmutables del registro original.
 */
export function contenidoCanonicoExcursion(
  excursion: Omit<
    import("./types").Excursion,
    "historial" | "eventLog" | "anclajeBlockchain" | "contentHash"
  >
): object {
  return {
    id: excursion.id,
    destino: excursion.destino,
    colonia: excursion.colonia,
    fecha: excursion.fecha,
    horaSalida: excursion.horaSalida,
    puntoSalida: excursion.puntoSalida,
    horaRegreso: excursion.horaRegreso,
    cupoMaximo: excursion.cupoMaximo,
    costo: excursion.costo,
    transporte: excursion.transporte,
    accesibilidad: excursion.accesibilidad,
    requiereAcompanante: excursion.requiereAcompanante,
    queLlevar: excursion.queLlevar,
    coordinadorId: excursion.coordinadorId,
    estado: excursion.estado,
    creadoEn: excursion.creadoEn,
  };
}

/**
 * Produce el contenido canónico de un check-in para hashear.
 * Se genera al marcar asistencia — es el "acta" de participación.
 */
export function contenidoCanonicoCheckin(inscripcion: {
  id: string;
  excursionId: string;
  usuarioId: string;
  inscritoPorId: string;
  asistenciaConfirmada: boolean;
  creadoEn: string;
}): object {
  return {
    id: inscripcion.id,
    excursionId: inscripcion.excursionId,
    usuarioId: inscripcion.usuarioId,
    inscritoPorId: inscripcion.inscritoPorId,
    asistenciaConfirmada: inscripcion.asistenciaConfirmada,
    creadoEn: inscripcion.creadoEn,
    checkinTimestamp: new Date().toISOString(),
  };
}

/**
 * Formatea un hash hex largo para mostrar en UI: primeros 8 + "..." + últimos 6.
 * Ejemplo: "a1b2c3d4...e5f6a7"
 */
export function formatearHash(hash: string): string {
  if (hash.length <= 18) return hash;
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

/**
 * Convierte un hash hex (string) al formato bytes32 de Solidity para
 * pasarlo al contrato DocumentRegistry.anclar().
 * Ejemplo: "0xa1b2c3d4..." (66 chars con 0x prefix)
 */
export function hexToBytes32(hash: string): `0x${string}` {
  const clean = hash.startsWith("0x") ? hash.slice(2) : hash;
  return `0x${clean.padStart(64, "0")}` as `0x${string}`;
}
