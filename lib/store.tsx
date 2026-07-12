"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { EXCURSIONES, INSCRIPCIONES, PERFILES_SALUD, USUARIOS } from "./seed-data";
import { AnclajeBlockchain, Excursion, Inscripcion, PerfilSalud, Usuario } from "./types";
import {
  contenidoCanonicoExcursion,
  hashObjeto,
} from "./crypto";

interface StoreState {
  usuarios: Usuario[];
  excursiones: Excursion[];
  inscripciones: Inscripcion[];
  perfilesSalud: PerfilSalud[];
  currentUserId: string;
  setCurrentUserId: (id: string) => void;
  currentUser: Usuario;
  perfilDe: (usuarioId: string) => PerfilSalud | undefined;
  inscripcionesDe: (excursionId: string) => Inscripcion[];
  inscripcionVigente: (excursionId: string, usuarioId: string) => Inscripcion | undefined;
  inscribir: (excursionId: string, usuarioId: string, llevaAcompanante: boolean) => Inscripcion;
  cancelarInscripcion: (inscripcionId: string) => void;
  crearExcursion: (data: Omit<Excursion, "id" | "estado" | "creadoEn" | "historial">) => Promise<Excursion>;
  guardarPerfilSalud: (perfil: Omit<PerfilSalud, "actualizadoEn">) => void;
  marcarAsistencia: (inscripcionId: string, asistio: boolean) => Promise<void>;
  registrarAnclajeBlockchain: (excursionId: string, anclaje: AnclajeBlockchain) => void;
  usuarioById: (id: string) => Usuario | undefined;
  usuarioPorTelefono: (telefono: string) => Usuario | undefined;
  usuarioPorEmail: (email: string) => Usuario | undefined;
  registrarUsuario: (data: Omit<Usuario, "id">) => Usuario;
  vincularFamiliar: (adultoId: string, familiarId: string) => void;
  /** B4: Cancela una excursión publicada o reprogramada con motivo obligatorio */
  cancelarExcursion: (excursionId: string, motivo: string) => void;
  /** B4: Reprograma la fecha de una excursión y pone todas las inscripciones en "pendiente" */
  reprogramarExcursion: (excursionId: string, nuevaFecha: string, motivo: string) => void;
  /** B4: El inscrito confirma o declina la nueva fecha de una excursión reprogramada */
  responderReprogramacion: (inscripcionId: string, respuesta: "confirmada" | "rechazada") => void;
}

const StoreContext = createContext<StoreState | null>(null);

let idCounter = 1000;
function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [usuarios, setUsuarios] = useState<Usuario[]>(USUARIOS);
  const [excursiones, setExcursiones] = useState<Excursion[]>(EXCURSIONES);
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>(INSCRIPCIONES);
  const [perfilesSalud, setPerfilesSalud] = useState<PerfilSalud[]>(PERFILES_SALUD);
  const [currentUserId, setCurrentUserId] = useState<string>("u-elena");

  const currentUser = useMemo(
    () => usuarios.find((u) => u.id === currentUserId) ?? usuarios[0],
    [usuarios, currentUserId]
  );

  const usuarioById = useCallback(
    (id: string) => usuarios.find((u) => u.id === id),
    [usuarios]
  );

  const normalizarTelefono = (t: string) => t.replace(/\D/g, "");

  const usuarioPorTelefono = useCallback(
    (telefono: string) => {
      const norm = normalizarTelefono(telefono);
      return usuarios.find((u) => normalizarTelefono(u.telefono) === norm);
    },
    [usuarios]
  );

  const usuarioPorEmail = useCallback(
    (email: string) => {
      const norm = email.trim().toLowerCase();
      return usuarios.find((u) => u.email?.toLowerCase() === norm);
    },
    [usuarios]
  );

  const registrarUsuario = useCallback(
    (data: Omit<Usuario, "id">): Usuario => {
      const nuevo: Usuario = { ...data, id: nextId("u") };
      setUsuarios((prev) => [...prev, nuevo]);
      return nuevo;
    },
    []
  );

  const vincularFamiliar = useCallback(
    (adultoId: string, familiarId: string) => {
      setUsuarios((prev) =>
        prev.map((u) => {
          if (u.id === adultoId) {
            const vinculados = u.familiaresVinculados ?? [];
            if (vinculados.includes(familiarId)) return u;
            return { ...u, familiaresVinculados: [...vinculados, familiarId] };
          }
          if (u.id === familiarId) {
            return { ...u, cuidaA: adultoId };
          }
          return u;
        })
      );
    },
    []
  );

  const perfilDe = useCallback(
    (usuarioId: string) => perfilesSalud.find((p) => p.usuarioId === usuarioId),
    [perfilesSalud]
  );

  const inscripcionesDe = useCallback(
    (excursionId: string) => inscripciones.filter((i) => i.excursionId === excursionId),
    [inscripciones]
  );

  const inscripcionVigente = useCallback(
    (excursionId: string, usuarioId: string) =>
      inscripciones.find(
        (i) => i.excursionId === excursionId && i.usuarioId === usuarioId && i.estado !== "cancelada"
      ),
    [inscripciones]
  );

  const inscribir = useCallback(
    (excursionId: string, usuarioId: string, llevaAcompanante: boolean) => {
      const excursion = excursiones.find((e) => e.id === excursionId)!;
      const confirmadas = inscripciones.filter(
        (i) => i.excursionId === excursionId && i.estado === "confirmada"
      ).length;
      const estado = confirmadas < excursion.cupoMaximo ? "confirmada" : "lista_espera";
      const nueva: Inscripcion = {
        id: nextId("in"),
        excursionId,
        usuarioId,
        inscritoPorId: currentUserId,
        estado,
        llevaAcompanante,
        asistenciaConfirmada: false,
        creadoEn: new Date(2026, 5, 15).toISOString(),
      };
      setInscripciones((prev) => [...prev, nueva]);
      return nueva;
    },
    [excursiones, inscripciones, currentUserId]
  );

  const cancelarInscripcion = useCallback((inscripcionId: string) => {
    setInscripciones((prev) =>
      prev.map((i) => (i.id === inscripcionId ? { ...i, estado: "cancelada" } : i))
    );
  }, []);

  const crearExcursion = useCallback(
    async (data: Omit<Excursion, "id" | "estado" | "creadoEn" | "historial">) => {
      const ahora = new Date(2026, 5, 20).toISOString();
      const id = nextId("ex");

      // Épica C: calcular hash del contenido inmutable antes de guardar
      const canónico = contenidoCanonicoExcursion({
        ...data,
        id,
        estado: "publicada",
        creadoEn: ahora,
      });
      const contentHash = await hashObjeto(canónico);

      const nueva: Excursion = {
        ...data,
        id,
        estado: "publicada",
        creadoEn: ahora,
        contentHash,
        historial: [
          {
            fecha: ahora,
            autorId: data.coordinadorId,
            accion: "Excursión creada y publicada",
          },
        ],
      };
      setExcursiones((prev) => [nueva, ...prev]);
      return nueva;
    },
    []
  );

  const guardarPerfilSalud = useCallback(
    (perfil: Omit<PerfilSalud, "actualizadoEn">) => {
      const ahora = new Date(2026, 5, 20).toISOString();
      setPerfilesSalud((prev) => {
        const existe = prev.some((p) => p.usuarioId === perfil.usuarioId);
        const actualizado: PerfilSalud = { ...perfil, actualizadoEn: ahora };
        if (existe) {
          return prev.map((p) => (p.usuarioId === perfil.usuarioId ? actualizado : p));
        }
        return [...prev, actualizado];
      });
    },
    []
  );

  const marcarAsistencia = useCallback(async (inscripcionId: string, asistio: boolean) => {
    // Épica C: al confirmar asistencia, generar un hash de solo el estado del check-in.
    // Privacidad: no incluimos usuarioId ni inscritoPorId en el pre-imagen del hash —
    // el hash del acta completa (con lista de asistentes anonimizada) se calcula en la
    // UI del panel de participantes usando contenidoCanonicoActa().
    let checkinHash: string | undefined;
    if (asistio) {
      checkinHash = await hashObjeto({
        inscripcionId,
        asistenciaConfirmada: true,
        timestamp: new Date().toISOString(),
      });
    }

    setInscripciones((prev) =>
      prev.map((i) =>
        i.id === inscripcionId
          ? { ...i, asistenciaConfirmada: asistio, ...(checkinHash ? { checkinHash } : {}) }
          : i
      )
    );
  }, [inscripciones]);

  const registrarAnclajeBlockchain = useCallback(
    (excursionId: string, anclaje: AnclajeBlockchain) => {
      setExcursiones((prev) =>
        prev.map((e) =>
          e.id === excursionId ? { ...e, anclajeBlockchain: anclaje } : e
        )
      );
    },
    []
  );

  // ── B4: Gestión de cancelación y reprogramación ───────────────────────────

  const cancelarExcursion = useCallback(
    (excursionId: string, motivo: string) => {
      const ahora = new Date().toISOString();
      setExcursiones((prev) =>
        prev.map((e) =>
          e.id === excursionId
            ? {
                ...e,
                estado: "cancelada" as const,
                motivoCambio: motivo,
                historial: [
                  ...e.historial,
                  { fecha: ahora, autorId: currentUserId, accion: "Excursión cancelada", motivo },
                ],
              }
            : e
        )
      );
    },
    [currentUserId]
  );

  const reprogramarExcursion = useCallback(
    (excursionId: string, nuevaFecha: string, motivo: string) => {
      const ahora = new Date().toISOString();
      setExcursiones((prev) =>
        prev.map((e) =>
          e.id === excursionId
            ? {
                ...e,
                estado: "reprogramada" as const,
                fecha: nuevaFecha,
                nuevaFecha,
                motivoCambio: motivo,
                historial: [
                  ...e.historial,
                  {
                    fecha: ahora,
                    autorId: currentUserId,
                    accion: "Excursión reprogramada",
                    motivo,
                  },
                ],
              }
            : e
        )
      );
      // Marcar inscripciones activas como pendientes de respuesta
      setInscripciones((prev) =>
        prev.map((i) =>
          i.excursionId === excursionId && i.estado !== "cancelada"
            ? { ...i, respuestaReprogramacion: "pendiente" as const }
            : i
        )
      );
    },
    [currentUserId]
  );

  const responderReprogramacion = useCallback(
    (inscripcionId: string, respuesta: "confirmada" | "rechazada") => {
      setInscripciones((prev) =>
        prev.map((i) =>
          i.id === inscripcionId
            ? {
                ...i,
                respuestaReprogramacion: respuesta,
                estado: respuesta === "rechazada" ? ("cancelada" as const) : i.estado,
              }
            : i
        )
      );
    },
    []
  );

  const value: StoreState = {
    usuarios,
    excursiones,
    inscripciones,
    perfilesSalud,
    currentUserId,
    setCurrentUserId,
    currentUser,
    perfilDe,
    inscripcionesDe,
    inscripcionVigente,
    inscribir,
    cancelarInscripcion,
    crearExcursion,
    guardarPerfilSalud,
    marcarAsistencia,
    usuarioById,
    usuarioPorTelefono,
    usuarioPorEmail,
    registrarUsuario,
    vincularFamiliar,
    registrarAnclajeBlockchain,
    cancelarExcursion,
    reprogramarExcursion,
    responderReprogramacion,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore debe usarse dentro de StoreProvider");
  return ctx;
}
