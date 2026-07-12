# Plan de Desarrollo — Águila Viajera

*Basado en `aguila-viajera-prd.md` (v1.0, fuente de verdad para alcance/stack) y
`aguila-viajera-mvp.md` (narrativa de problema, versión previa de alcance).*

---

## 0. Nota sobre conflicto entre documentos

`aguila-viajera-mvp.md` y `aguila-viajera-prd.md` no describen el mismo MVP:

| | MVP (doc previo) | PRD v1.0 (doc vigente) |
|---|---|---|
| Alcance | Registro + excursiones + **acta en blockchain (Ethereum)** | Solo **Turismo Comunitario**; blockchain/repositorio documental → Fase 3 |
| Auth | Privy (correo/teléfono, sin wallet) | Teléfono + OTP |
| Frontend | React web único | Flutter/RN (móvil) + React+TS (panel coordinador) separados |
| Chatbot IA | Sí, Claude API, punto de entrada | No mencionado |
| Modelo de negocio | No especificado | B2B2C — licenciar a entidades financieras, COPACO como piloto/showcase |

El PRD está marcado explícitamente como **"Draft para desarrollo — listo para generar tickets"**
y fecha posterior, así que este plan lo trata como la fuente de verdad para alcance, personas,
criterios de aceptación y stack técnico. El MVP se conserva como contexto de problema/visión de
producto a largo plazo (el chatbot IA y la capa blockchain no desaparecen del roadmap del
producto, pero quedan fuera del MVP que se construye ahora — ver Fase 3 del PRD, sección 6).

**Decisión para este plan:** construir siguiendo el PRD. Si en algún punto se necesita retomar
blockchain/Privy/chatbot, es trabajo de Fase 3, no de este MVP.

---

## 1. Alcance del MVP (resumen accionable)

Un solo módulo: **Turismo Comunitario**. Cuatro épicas (PRD §2):

- **Épica A** — Registro y perfil de usuario (adulto mayor, familiar, coordinador con validación manual).
- **Épica B** — Gestión de excursiones (crear, inscribirse, panel de participantes, cancelar/reprogramar).
- **Épica C** — Confianza y transparencia (registro append-only con autor+timestamp, sin blockchain — es la base técnica que blockchain reutilizará en Fase 3).
- **Épica D** — Panel institucional (dashboard de adopción/impacto para el sponsor).

Explícitamente fuera de alcance (PRD §1.2 y §6): repositorio documental con actas, buzón de
sugerencias con IA, directorio de 30+ servicios, blockchain, multi-tenancy activo (el modelo de
datos debe *soportarlo* desde el diseño, pero solo hay un tenant real: COPACO Iztapalapa).

---

## 2. Fases (siguiendo PRD §6, con el prototipo de esta sesión como Fase -1)

### Fase -1 — Prototipo frontend navegable (esta sesión)
Objetivo: validar los 4 flujos de UX del PRD (§3.2) con COPACO **antes** de construir backend,
auth real, integraciones de WhatsApp/SMS o infraestructura en la nube. Sin esto, cualquier
inversión en Fase 0 corre el riesgo de construir sobre una UX no validada con Doña Elena / Don
Raúl reales.

- Web app única (Next.js + TypeScript + Tailwind), responsive mobile-first.
- Datos en memoria (mock), sin backend, sin auth real, sin notificaciones reales.
- Cubre: listado/detalle/inscripción a excursión, wizard de creación de excursión, perfil de
  salud, panel de participantes con check-in.
- Aplica los principios de accesibilidad no negociables del PRD §3.1 (tipografía ≥18px,
  contraste AA/AAA, botones ≥44x44px, confirmaciones explícitas para acciones irreversibles).
- Entregable: prototipo corriendo localmente (`npm run dev`) para sesiones de usability testing.

### Fase 0 — Fundacional (PRD: semanas 1-3)
- Congelar modelo de datos multi-tenant real (Postgres) a partir de lo aprendido en el prototipo.
- Setup de infraestructura backend (framework a definir — PRD sugiere NestJS), autenticación por
  teléfono/OTP real.
- Usability testing con 3-5 usuarios reales de COPACO usando el prototipo de Fase -1 como
  instrumento de prueba — ajustar antes de codificar el backend definitivo.
- Iniciar trámite de WhatsApp Business API (verificación puede tardar semanas — es dependencia
  crítica bloqueante para Fase 1, según PRD §6).

### Fase 1 — MVP núcleo: Turismo Comunitario (PRD: semanas 4-10)
- Épica A completa (registro adulto mayor, perfil de salud versionado, registro coordinador con
  validación manual por admin COPACO).
- Épica B completa (crear/publicar excursión, inscripción con alerta de accesibilidad, panel de
  participantes, cancelación/reprogramación con notificación).
- Notificaciones: push + WhatsApp como mínimo; SMS recomendado desde el MVP dado el perfil de
  usuario (PRD §4.3), aunque puede diferirse bajo presión de tiempo.
- Integridad de registros (Épica C1): tablas append-only desde el diseño inicial de excursiones —
  no se puede añadir después sin migración costosa.
- Datos de salud cifrados en reposo/tránsito, control de acceso a nivel de campo (PRD §4.4).

### Fase 2 — Panel institucional y piloto medible (PRD: semanas 11-14)
- Épica D (dashboard institucional, datos agregados/anonimizados, export CSV).
- Instrumentación de KPIs de impacto, adopción, calidad y negocio (PRD §5).
- Piloto real en 5-10 colonias de Iztapalapa, línea base de métricas.

### Fase 3 — Post-MVP (condicionado a resultados del piloto)
- Repositorio documental verificable (actas, solicitudes de infraestructura) — aquí es donde
  vuelve a entrar la capa blockchain/Ethereum descrita en el MVP original.
- Buzón de sugerencias con IA / chatbot — aquí es donde vuelve a entrar el chatbot Claude del MVP
  original.
- Directorio de 30+ servicios comunitarios.
- Offline-first extendido más allá del check-in.
- Activar multi-tenancy para nuevas comunidades (modelo de licenciamiento B2B2C).

---

## 3. Dependencias críticas antes de Fase 1 (PRD §6)

1. Acceso a WhatsApp Business API — iniciar en Fase 0 por el tiempo de verificación.
2. Validación legal del tratamiento de datos de salud bajo LFPDPPP antes de producción real.
3. Acuerdo con COPACO sobre quién tiene rol de "administrador" validador de coordinadores
   (proceso humano, debe resolverse antes de que Épica A3 lo necesite en producción).

---

## 4. Qué se construye en esta sesión (Fase -1, detalle técnico)

Stack: **Next.js (App Router) + TypeScript + Tailwind CSS**, un solo proyecto web, sin backend.

- `lib/types.ts` — tipos: `Usuario`, `PerfilSalud`, `Excursion`, `Inscripcion`.
- `lib/store` — estado en memoria con datos semilla (persona Doña Elena, Don Raúl, 2-3
  excursiones de ejemplo), sin persistencia real (se resetea al recargar — aceptable para
  prototipo de validación de UX).
- Rutas:
  - `/` — listado de excursiones (Flujo 1, paso 1-2).
  - `/excursiones/[id]` — detalle + alerta de accesibilidad + inscripción (Flujo 1, paso 3-5).
  - `/coordinador/nueva-excursion` — wizard de 4 pasos (Flujo 2).
  - `/coordinador/excursiones/[id]/participantes` — panel de participantes + check-in (Flujo 4).
  - `/perfil-salud` — formulario de perfil de salud segmentado (Flujo 3).
- No incluye: auth real, WhatsApp/SMS, mapas, dashboard institucional (Épica D), append-only real
  (se simula con IDs y timestamp en memoria para mostrar el concepto en la UI, no como garantía
  real de integridad).

Este prototipo es desechable/evolutivo: sirve para validar UX, no es la base de código de
producción. La decisión de si el frontend final es Next.js, Flutter o RN se toma después de la
validación, según lo que el PRD recomienda (Flutter/RN para el móvil del adulto mayor, dado el
predominio de Android gama baja en el usuario objetivo).
