import { Excursion, Inscripcion, PerfilSalud, Usuario } from "./types";

export const USUARIOS: Usuario[] = [
  {
    id: "u-elena",
    nombre: "Elena Martínez",
    rol: "adulto_mayor",
    telefono: "55 1234 5678",
    colonia: "San Miguel Teotongo",
    familiaresVinculados: ["u-ana"],
  },
  {
    id: "u-ana",
    nombre: "Ana Martínez",
    rol: "familiar",
    telefono: "55 8765 4321",
    colonia: "San Miguel Teotongo",
    cuidaA: "u-elena",
  },
  {
    id: "u-raul",
    nombre: "Raúl Gómez",
    rol: "coordinador",
    telefono: "55 2468 1357",
    colonia: "San Miguel Teotongo",
  },
  {
    id: "u-carmen",
    nombre: "Carmen Reyes",
    rol: "adulto_mayor",
    telefono: "55 3691 2580",
    colonia: "Santa Cruz Meyehualco",
  },
];

export const PERFILES_SALUD: PerfilSalud[] = [
  {
    usuarioId: "u-elena",
    movilidad: "baston",
    condiciones: ["Hipertensión"],
    condicionLibre: "",
    medicamentos: [{ nombre: "Losartán", horario: "8:00 am y 8:00 pm" }],
    acompananteRequerido: true,
    contactoEmergencia: {
      nombre: "Ana Martínez",
      telefono: "55 8765 4321",
      relacion: "Hija",
    },
    actualizadoEn: "2026-06-02T10:00:00-06:00",
    actualizadoPorId: "u-ana",
  },
  {
    usuarioId: "u-carmen",
    movilidad: "independiente",
    condiciones: [],
    condicionLibre: "",
    medicamentos: [],
    acompananteRequerido: false,
    contactoEmergencia: {
      nombre: "Jorge Reyes",
      telefono: "55 1111 2222",
      relacion: "Hijo",
    },
    actualizadoEn: "2026-05-20T09:00:00-06:00",
    actualizadoPorId: "u-carmen",
  },
];

export const EXCURSIONES: Excursion[] = [
  {
    id: "ex-1",
    destino: "Museo Nacional de Antropología",
    colonia: "San Miguel Teotongo",
    fecha: "2026-07-25",
    horaSalida: "08:00",
    puntoSalida: "Explanada COPACO, San Miguel Teotongo",
    horaRegreso: "16:00",
    cupoMaximo: 25,
    costo: 0,
    transporte: "Autobús rentado por COPACO",
    accesibilidad: {
      tieneEscaleras: true,
      tienePuentesSinRampa: false,
      terrenoIrregular: false,
    },
    requiereAcompanante: true,
    queLlevar: ["Identificación oficial", "Medicamentos personales", "Agua"],
    coordinadorId: "u-raul",
    estado: "publicada",
    creadoEn: "2026-06-01T09:00:00-06:00",
    imagenEmoji: "🏛️",
    descripcionLarga:
      "Uno de los recintos culturales más importantes de México, con salas dedicadas a las culturas prehispánicas y paradas de descanso programadas.",
    historial: [
      {
        fecha: "2026-06-01T09:00:00-06:00",
        autorId: "u-raul",
        accion: "Excursión creada y publicada",
      },
    ],
  },
  {
    id: "ex-2",
    destino: "Parque Ecológico Xochimilco",
    colonia: "San Miguel Teotongo",
    fecha: "2026-08-02",
    horaSalida: "09:00",
    puntoSalida: "Explanada COPACO, San Miguel Teotongo",
    horaRegreso: "15:00",
    cupoMaximo: 20,
    costo: 50,
    transporte: "Autobús rentado por COPACO",
    accesibilidad: {
      tieneEscaleras: false,
      tienePuentesSinRampa: false,
      terrenoIrregular: true,
    },
    requiereAcompanante: false,
    queLlevar: ["Identificación oficial", "Sombrero", "Bloqueador solar"],
    coordinadorId: "u-raul",
    estado: "publicada",
    creadoEn: "2026-06-05T11:00:00-06:00",
    imagenEmoji: "🌳",
    descripcionLarga:
      "Recorrido en trajinera por los canales y chinampas de Xochimilco, patrimonio natural de la Ciudad de México, con tiempo de descanso a la sombra.",
    historial: [
      {
        fecha: "2026-06-05T11:00:00-06:00",
        autorId: "u-raul",
        accion: "Excursión creada y publicada",
      },
    ],
  },
  {
    id: "ex-3",
    destino: "Basílica de Guadalupe",
    colonia: "Santa Cruz Meyehualco",
    fecha: "2026-08-12",
    horaSalida: "07:30",
    puntoSalida: "Iglesia Santa Cruz Meyehualco",
    horaRegreso: "14:00",
    cupoMaximo: 30,
    costo: 0,
    transporte: "Autobús rentado por COPACO",
    accesibilidad: {
      tieneEscaleras: false,
      tienePuentesSinRampa: true,
      terrenoIrregular: false,
    },
    requiereAcompanante: false,
    queLlevar: ["Identificación oficial", "Medicamentos personales"],
    coordinadorId: "u-raul",
    estado: "publicada",
    creadoEn: "2026-06-10T08:00:00-06:00",
    imagenEmoji: "⛪",
    descripcionLarga:
      "Visita al recinto religioso más visitado del país, con acceso facilitado para el grupo y tiempo libre dentro del recorrido.",
    historial: [
      {
        fecha: "2026-06-10T08:00:00-06:00",
        autorId: "u-raul",
        accion: "Excursión creada y publicada",
      },
    ],
  },
];

export const INSCRIPCIONES: Inscripcion[] = [
  {
    id: "in-1",
    excursionId: "ex-1",
    usuarioId: "u-carmen",
    inscritoPorId: "u-carmen",
    estado: "confirmada",
    llevaAcompanante: false,
    asistenciaConfirmada: false,
    creadoEn: "2026-06-03T10:00:00-06:00",
  },
];
