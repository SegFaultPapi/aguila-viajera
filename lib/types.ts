export type Rol = "adulto_mayor" | "familiar" | "coordinador";

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
  estado: "publicada" | "cancelada" | "completada";
  creadoEn: string;
  imagenEmoji: string;
  historial: RegistroHistorial[];
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
}
