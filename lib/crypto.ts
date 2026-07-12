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
 * Produce el contenido canónico del ACTA de asistencia de una excursión.
 *
 * Diseño de privacidad (PRD §4.4):
 * - NO incluye nombres, teléfonos ni datos de salud.
 * - NO incluye usuarioIds individuales directamente en la estructura que se ancla.
 *   En su lugar, usa un "hash de la lista de asistentes" — una huella de quién asistió
 *   sin exponer los IDs uno a uno. Para verificar quién asistió se necesita la BD completa,
 *   no solo el dato en cadena.
 * - Solo el coordinador responsable (coordinadorId) queda referenciado, porque es el
 *   firmante institucional COPACO — dato necesario para la rendición de cuentas pública.
 *
 * Lo que llega a blockchain: { excursionId, fecha, coordinadorId, totalAsistentes,
 *   hashListaAsistentes, timestamp } — sin nombres, sin datos sensibles.
 */
export async function contenidoCanonicoActa(params: {
  excursionId: string;
  excursionFecha: string;
  coordinadorId: string;
  /** IDs internos de quienes asistieron — se hashean, no se exponen */
  idsAsistentes: string[];
  actaTimestamp: string;
}): Promise<object> {
  // Ordenar y hashear la lista de IDs para producir una huella verificable
  // sin revelar los IDs individuales en la estructura anclada.
  const idsOrdenados = [...params.idsAsistentes].sort().join("|");
  const hashLista = await sha256Hex(idsOrdenados);

  return {
    excursionId: params.excursionId,
    fecha: params.excursionFecha,
    coordinadorId: params.coordinadorId,
    totalAsistentes: params.idsAsistentes.length,
    // Solo la huella de la lista — no los IDs crudos
    hashListaAsistentes: hashLista,
    actaTimestamp: params.actaTimestamp,
  };
}

/**
 * @deprecated Usar contenidoCanonicoActa para el acta de asistencia completa.
 * Esta función expone usuarioId en el pre-imagen del hash, lo que permite
 * correlación si el atacante conoce la base de datos.
 * Se mantiene solo para compatibilidad temporal con el store.
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
    // No incluir usuarioId ni inscritoPorId directamente
    // Solo el estado del check-in y el contexto mínimo
    asistenciaConfirmada: inscripcion.asistenciaConfirmada,
    creadoEn: inscripcion.creadoEn,
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
