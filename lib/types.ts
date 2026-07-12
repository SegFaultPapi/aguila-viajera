export type Rol = "adulto_mayor" | "familiar" | "coordinador";

// ── Épica C: Integridad de registros ─────────────────────────────────────────

/**
 * Estado de anclaje en blockchain. El prototipo lo simula en memoria;
 * en producción (Fase 1) este campo se persiste en la tabla append-only.
 */
export interface AnclajeBlockchain {
  /** Hash de la transacción Ethereum que ancló el registro */
  txHash: string;
  /** ID del registro devuelto por DocumentRegistry.anclar() */
  registroId: string;
  /** Número de bloque donde quedó incluida la tx */
  blockNumber: number;
  /** Timestamp ISO del bloque */
  ancladoEn: string;
  /** Red: "sepolia" (testnet) o "mainnet" */
  red: "sepolia" | "mainnet";
}

/**
 * Entrada append-only del log de eventos de una excursión.
 * Nunca se modifica — los cambios generan una nueva entrada referenciando la anterior.
 */
export interface EventoLog {
  /** Hash SHA-256 (hex) del contenido serializado de este evento */
  contentHash: string;
  fecha: string;
  autorId: string;
  accion: string;
  motivo?: string;
  /** Referencia al hash del evento anterior (null = primer evento) */
  hashPrevio: string | null;
  /** Anclaje en cadena, si ya se ancló */
  anclaje?: AnclajeBlockchain;
}

export type Movilidad =
  | "independiente"
  | "baston"
  | "andadera"
  | "silla_ruedas"
  | "no_aplica";

export interface Usuario {
  id: string;
  nombre: string;
  rol: Rol;
  telefono: string;
  colonia: string;
  email?: string;
  familiaresVinculados?: string[];
  cuidaA?: string;
}

export interface Medicamento {
  nombre: string;
  horario: string;
}

export interface PerfilSalud {
  usuarioId: string;
  movilidad: Movilidad;
  condiciones: string[];
  condicionLibre?: string;
  medicamentos: Medicamento[];
  acompananteRequerido: boolean;
  contactoEmergencia: {
    nombre: string;
    telefono: string;
    relacion: string;
  };
  actualizadoEn: string;
  actualizadoPorId: string;
}

/** @deprecated Usar EventoLog — este tipo persiste solo para compatibilidad con seed-data */
export interface RegistroHistorial {
  fecha: string;
  autorId: string;
  accion: string;
  motivo?: string;
}

export interface Excursion {
  id: string;
  destino: string;
  colonia: string;
  fecha: string;
  horaSalida: string;
  puntoSalida: string;
  horaRegreso: string;
  cupoMaximo: number;
  costo: number;
  transporte: string;
  accesibilidad: {
    tieneEscaleras: boolean;
    tienePuentesSinRampa: boolean;
    terrenoIrregular: boolean;
  };
  requiereAcompanante: boolean;
  queLlevar: string[];
  coordinadorId: string;
  estado: "publicada" | "cancelada" | "completada" | "reprogramada";
  creadoEn: string;
  imagenEmoji: string;
  descripcionLarga?: string;
  historial: RegistroHistorial[];
  /** Hash SHA-256 (hex) del contenido canónico de esta excursión al momento de su creación */
  contentHash?: string;
  /** Log append-only de eventos (incluye el evento de creación como primer entrada) */
  eventLog?: EventoLog[];
  /** Anclaje del registro de creación en Ethereum */
  anclajeBlockchain?: AnclajeBlockchain;
  /** Motivo de cancelación o reprogramación (campo obligatorio al ejecutar la acción) */
  motivoCambio?: string;
  /** Nueva fecha efectiva si fue reprogramada */
  nuevaFecha?: string;
}

export type EstadoInscripcion = "confirmada" | "lista_espera" | "cancelada";

export interface Inscripcion {
  id: string;
  excursionId: string;
  usuarioId: string;
  inscritoPorId: string;
  estado: EstadoInscripcion;
  llevaAcompanante: boolean;
  asistenciaConfirmada: boolean;
  creadoEn: string;
  /** Hash SHA-256 (hex) del contenido de este check-in al momento de confirmarse */
  checkinHash?: string;
  /** Respuesta del inscrito ante una reprogramación; "pendiente" = aún no responde */
  respuestaReprogramacion?: "pendiente" | "confirmada" | "rechazada";
}
