# PRD — Águila Viajera (MVP)
**Product Requirements Document — v1.0**

| | |
|---|---|
| **Producto** | Águila Viajera |
| **Cliente / Comunidad piloto** | COPACO — Iztapalapa, CDMX |
| **Modelo de negocio** | B2B2C — licenciamiento de la plataforma a entidades financieras (bancos, fintechs, cajas de ahorro) como herramienta de responsabilidad social / inclusión financiera de adultos mayores, con COPACO Iztapalapa como comunidad piloto/showcase |
| **Estado** | Draft para desarrollo — listo para generar tickets |
| **Fecha** | Julio 2026 |

---

## 0. Resumen ejecutivo

Águila Viajera digitaliza el trabajo 100% voluntario de las COPACO (12,000 ciudadanos organizados en Iztapalapa) para resolver tres problemas concretos: gestión insegura de excursiones para adultos mayores (750+ muertes en 3 años por malos traslados), borrado institucional de registros y documentación, y exclusión digital de adultos mayores que hoy dependen únicamente de WhatsApp.

El MVP se enfoca en el **módulo de Turismo Comunitario** (el de mayor riesgo humano y el más fácil de demostrar con valor tangible), dejando el Repositorio Documental y el Canal Ciudadano como fases posteriores. Esto es deliberado: una entidad financiera compradora necesita ver un caso de uso claro, medible y con impacto humano directo antes de considerar el resto de la suite.

---

## 1. Project Overview

### 1.1 El problema

Iztapalapa concentra 1.85 millones de habitantes, ~30% adultos mayores. Las COPACO organizan excursiones y actividades comunitarias para este grupo de forma manual, vía WhatsApp, sin:

- Registro de condiciones médicas o de movilidad reducida (demencia senil, uso de andadera/silla de ruedas, medicamentos críticos).
- Control de aforo, accesibilidad de la ruta (puentes peatonales sin rampas) o disponibilidad de personal de salud.
- Trazabilidad de quién asistió, quién confirmó, quién es responsable de cada persona en cada tramo.

Consecuencia medible: **más de 750 muertes en 3 años** asociadas a traslados mal gestionados en la zona.

En paralelo, el gobierno local ha borrado folios y actas generadas por COPACO, apropiándose de su trabajo — lo que hace que la app deba, desde el diseño, dejar rastro verificable e inmutable de lo que cada voluntario y organización crea.

### 1.2 Objetivos del MVP

| Objetivo | Tipo |
|---|---|
| Eliminar el riesgo de traslado sin información médica/accesibilidad para adultos mayores en excursiones COPACO | Objetivo primario (impacto humano) |
| Dar a COPACO un sistema de registro de excursiones que reemplace la coordinación por WhatsApp | Objetivo primario (operativo) |
| Generar un registro con timestamp/autoría no editable por terceros de cada excursión y acta relacionada | Objetivo secundario (defensa institucional) |
| Producir métricas de uso, seguridad y adopción demostrables ante una entidad financiera compradora | Objetivo de negocio |

**Fuera de alcance del MVP:** repositorio documental completo (actas, solicitudes de infraestructura), buzón de sugerencias con IA, directorio de 30+ servicios. Se documentan en el roadmap (sección 6) pero no se construyen ahora.

### 1.3 Usuarios objetivo (personas)

**Persona 1 — "Doña Elena", 74 años, adulto mayor beneficiaria**
Vive sola en Iztapalapa, movilidad reducida (usa bastón), hijos que la visitan los fines de semana. Desconfía de compartir datos personales por miedo a fraude. No tiene smartphone propio — su hija se lo administra o usa un teléfono básico. Necesita: confirmar su lugar en una excursión, que quede claro qué necesita llevar (medicamento, acompañante), y sentirse seguro de que alguien sabe su condición médica si algo pasa.

**Persona 2 — "Don Raúl", 61 años, voluntario coordinador COPACO**
Preside la comisión de su colonia. Coordina 3-4 excursiones al mes para 20-40 personas, hoy con hilos de WhatsApp que se pierden. Sin capacitación técnica formal pero usa WhatsApp y Facebook diariamente. Necesita: dar de alta una excursión en minutos, ver de un vistazo quién tiene condiciones médicas especiales, y confirmar aforo/transporte sin perseguir mensajes.

**Persona 3 — "Familiar cuidador" (Ana, 42 años, hija de Doña Elena)**
No vive con su mamá pero es responsable de su información médica. Necesita: cargar el perfil de salud de su mamá una vez y no repetirlo cada excursión, recibir notificación cuando su mamá se inscribe a algo.

**Persona 4 — Administrador/gestor institucional (perfil comprador — entidad financiera / alcaldía)**
No es usuario diario pero es el sponsor/comprador. Necesita: dashboard de métricas de adopción, seguridad e impacto para justificar el patrocinio o licenciamiento de la plataforma.

---

## 2. User Stories & Acceptance Criteria

Convención: **Como** [persona], **quiero** [acción], **para** [beneficio]. Cada historia incluye criterios de aceptación (AC) verificables.

### Épica A — Registro y perfil de usuario

**A1. Registro simplificado de adulto mayor**
Como Doña Elena (o su familiar), quiero crear mi perfil con el mínimo de fricción posible, para poder inscribirme a excursiones sin necesitar ayuda técnica constante.
- AC1: El registro permite alta con nombre, teléfono y, opcionalmente, correo (no obligatorio).
- AC2: El registro puede completarse en menos de 5 pasos / 3 minutos en un dispositivo de gama baja.
- AC3: El usuario puede designar 1 o más "familiares/cuidadores" con permiso para editar su perfil de salud.
- AC4: Textos e interfaz en tipografía grande (mínimo 18px), alto contraste, sin jerga técnica (cumple lineamientos de accesibilidad, ver sección 3.4).

**A2. Perfil de salud y accesibilidad**
Como familiar cuidador, quiero registrar las condiciones médicas y de movilidad de mi familiar, para que los organizadores sepan cómo apoyarlo en cada excursión.
- AC1: El perfil captura: movilidad (independiente / bastón / andadera / silla de ruedas / no aplica), condiciones relevantes (ej. demencia senil, diabetes, hipertensión — campo estructurado + campo libre opcional), medicamentos críticos y horarios, contacto de emergencia.
- AC2: Este perfil es visible únicamente para el propio usuario, sus familiares autorizados y el/los coordinador(es) de la excursión a la que se inscribe (no público, no visible para otros participantes).
- AC3: El usuario/familiar puede editar el perfil en cualquier momento; los cambios quedan versionados con fecha (para trazabilidad médica).
- AC4: Existe un aviso de privacidad breve y en lenguaje claro visible antes de capturar datos de salud, cumpliendo con tratamiento de datos sensibles (ver 4.4).

**A3. Registro de voluntario/coordinador COPACO**
Como Don Raúl, quiero registrarme como coordinador de mi colonia, para poder crear y administrar excursiones.
- AC1: El alta de coordinador requiere validación manual (por un admin COPACO) antes de otorgar permisos de creación de excursiones — previene suplantación.
- AC2: Un coordinador queda vinculado a su colonia/comisión específica.

### Épica B — Gestión de excursiones

**B1. Crear una excursión**
Como Don Raúl, quiero publicar una excursión con toda su información logística, para que los adultos mayores y sus familiares decidan si pueden/deben inscribirse.
- AC1: El formulario captura: nombre del destino, fecha y hora, punto y hora de salida/regreso, cupo máximo, costo (default: gratuito), medio de transporte, requisitos de accesibilidad de la ruta (¿hay escaleras, puentes sin rampa, terreno irregular?), qué debe llevar el participante (identificación, medicamentos, acompañante obligatorio sí/no), y datos de contacto del coordinador responsable.
- AC2: El coordinador puede marcar la excursión como "requiere acompañante" para quienes tengan cierto nivel de movilidad/condición registrada.
- AC3: Al publicar, la excursión queda con timestamp de creación y autoría (ID del coordinador) inmutable — no editable por nadie fuera de la plataforma ni por administradores externos a COPACO (ver 4.5, integridad de registros).
- AC4: La excursión es visible en un listado público filtrable por fecha y colonia.

**B2. Inscripción a una excursión**
Como Doña Elena o su familiar, quiero inscribirme a una excursión viendo claramente si es apta para mi condición, para tomar una decisión informada.
- AC1: Al ver el detalle de la excursión, si el perfil de salud del usuario indica una condición relevante (ej. silla de ruedas) y la ruta no es accesible, el sistema muestra una alerta visible antes de confirmar inscripción (no bloquea, pero advierte).
- AC2: La inscripción se confirma solo cuando el cupo lo permite; si está lleno, se ofrece lista de espera.
- AC3: El sistema envía confirmación por notificación push (o SMS/WhatsApp como fallback, ver 4.3) al usuario y a su familiar registrado.
- AC4: El usuario puede cancelar su inscripción hasta X horas antes (configurable por el coordinador), liberando el cupo automáticamente a la lista de espera.

**B3. Panel de coordinador — vista de participantes**
Como Don Raúl, quiero ver de un vistazo la lista de inscritos con sus necesidades especiales, para planear transporte, apoyo y contingencias.
- AC1: Vista de lista con: nombre, condición de movilidad (ícono resumen), si requiere acompañante, si lleva acompañante confirmado, contacto de emergencia.
- AC2: El detalle médico completo requiere un tap adicional (para evitar sobre-exposición accidental de datos sensibles en la vista general).
- AC3: El coordinador puede exportar o compartir (vía enlace protegido, no PDF público) esta lista antes de la salida.
- AC4: El coordinador puede marcar asistencia el día del evento (check-in), generando el registro histórico de participación.

**B4. Cancelación y reprogramación**
Como Don Raúl, quiero cancelar o reprogramar una excursión, para poder reaccionar a cambios de clima, transporte o disponibilidad de personal de salud.
- AC1: Al cancelar, todos los inscritos reciben notificación inmediata con motivo (campo obligatorio de texto breve).
- AC2: Al reprogramar, se conserva la lista de inscritos con opción individual de confirmar/declinar la nueva fecha.
- AC3: El historial de cambios de una excursión (fecha original, motivo, nueva fecha) queda registrado y visible para el coordinador y los inscritos.

### Épica C — Confianza y transparencia (mínimo viable de "registro verificable")

**C1. Registro con autoría no editable**
Como voluntario COPACO, quiero que lo que publico quede registrado con mi autoría y fecha de forma que nadie externo pueda borrarlo o modificarlo, para proteger el trabajo de la comisión frente a terceros.
- AC1: Cada excursión y cada acción de check-in genera un registro con hash o ID único, autor, timestamp — almacenado de forma append-only (no updates destructivos, solo nuevas versiones referenciando la anterior).
- AC2: Existe una vista de "historial" por excursión mostrando todos los cambios con autor y fecha.
- *(Nota: el repositorio documental completo con actas y solicitudes de infraestructura es Fase 2 — aquí solo se sienta la base técnica de integridad de datos que se reutilizará después.)*

### Épica D — Panel institucional (comprador/sponsor)

**D1. Dashboard de adopción e impacto**
Como administrador/entidad financiera patrocinadora, quiero ver métricas agregadas de uso e impacto, para justificar y reportar el patrocinio de la plataforma.
- AC1: Dashboard con: número de excursiones creadas, número de adultos mayores activos, número de coordinadores activos, tasa de asistencia/no-show, incidentes reportados (ninguno idealmente) — ver KPIs en sección 5.
- AC2: Datos agregados y anonimizados — nunca se expone información médica individual en este panel.
- AC3: Exportable en reporte simple (CSV o vista imprimible) para reportes trimestrales del patrocinador.

---

## 3. UI/UX Requirements

### 3.1 Principios de diseño (no negociables dado el perfil de usuario)

1. **Accesibilidad primero, no como feature adicional.** Tipografía mínima 18px, contraste AA/AAA, botones grandes (mínimo 44x44px), lenguaje simple sin anglicismos ni jerga técnica.
2. **Cero fricción para el adulto mayor, control delegable al familiar.** Cualquier tarea compleja (perfil de salud, pagos si los hubiera) debe poder delegarse a un "familiar autorizado" sin que eso excluya al adulto mayor de ver su propia información.
3. **WhatsApp como red de seguridad, no como competencia.** Dado que hoy todo pasa por WhatsApp, el MVP debe permitir notificaciones vía WhatsApp/SMS para quienes no adopten la app completamente (ver 4.3).
4. **Transparencia visible, no oculta en configuraciones.** Quién ve tus datos médicos y por qué debe ser visible en la misma pantalla donde los capturas, no en un aviso de privacidad separado que nadie lee.

### 3.2 Flujos de usuario principales

**Flujo 1 — Adulto mayor se inscribe a una excursión**
1. Abre app / recibe enlace de WhatsApp con la excursión → Pantalla de listado de excursiones (o detalle directo si vino de enlace).
2. Ve tarjeta de excursión: destino, fecha, foto, cupo disponible, ícono de accesibilidad.
3. Toca "Ver detalle" → ve requisitos, ruta, si requiere acompañante.
4. Si su perfil de salud sugiere riesgo con esa ruta → ve alerta clara ("Esta ruta tiene escalones. ¿Vas con acompañante?").
5. Toca "Inscribirme" → confirmación en pantalla + notificación a familiar.

**Flujo 2 — Coordinador crea una excursión**
1. Pantalla principal de coordinador → botón "Nueva excursión".
2. Formulario por pasos (wizard, no scroll infinito): (a) datos básicos, (b) logística y transporte, (c) requisitos de accesibilidad y salud, (d) revisión y publicar.
3. Confirmación de publicación → excursión visible en listado de su colonia.

**Flujo 3 — Familiar da de alta el perfil de salud**
1. Recibe invitación (enlace) del adulto mayor o se registra directamente como "familiar de".
2. Formulario de perfil de salud, con explicación de quién más lo verá antes de cada campo sensible.
3. Guarda → puede recibir notificaciones cuando el adulto mayor se inscribe a algo.

**Flujo 4 — Día de la excursión (check-in)**
1. Coordinador abre panel de participantes de la excursión del día.
2. Marca asistencia con un tap por persona (lista con foto/nombre grande, apto para uso rápido en campo, posiblemente sin conexión — ver 4.6 offline-first).
3. Al finalizar, el sistema marca la excursión como "completada" y guarda el registro histórico.

### 3.3 Wireframes — descripción funcional (no visual, para referencia de developer)

- **Pantalla "Listado de excursiones"**: tarjetas verticales, cada una con imagen, nombre, fecha, ícono grande de accesibilidad (♿ / bastón / ninguno), botón "Ver detalle". Filtro superior por colonia y fecha.
- **Pantalla "Detalle de excursión"**: header con imagen y datos clave, sección de "Qué necesitas llevar" en lista con íconos, sección de accesibilidad de la ruta con alerta condicional, botón grande "Inscribirme" fijo al fondo de pantalla (sticky).
- **Pantalla "Mi perfil de salud"**: formulario segmentado en tarjetas (Movilidad / Condiciones / Medicamentos / Contacto de emergencia), cada tarjeta editable independientemente, indicador de "última actualización: [fecha]".
- **Panel coordinador "Participantes"**: lista tipo tabla simplificada (no tabla densa) — nombre grande, ícono de condición, checkbox grande de asistencia, tap para expandir detalle médico.
- **Dashboard institucional**: 4-6 tarjetas de KPI arriba (números grandes), gráfica de adopción en el tiempo, tabla exportable abajo.

### 3.4 Accesibilidad y consideraciones para adultos mayores

- Soporte para lector de pantalla (labels ARIA / accessibility labels nativos completos).
- Modo de "texto grande" activable, no solo depender del sistema operativo.
- Evitar gestos complejos (swipe múltiple, long-press) para acciones críticas; preferir botones explícitos.
- Confirmaciones de acciones irreversibles (cancelar inscripción, eliminar perfil) siempre con diálogo explícito, nunca un solo tap.

---

## 4. Technical Requirements

### 4.1 Stack propuesto

| Capa | Recomendación | Justificación |
|---|---|---|
| Frontend móvil | Flutter o React Native | Un solo código base para Android/iOS; el usuario objetivo (adultos mayores de bajos recursos en Iztapalapa) probablemente usa Android gama baja predominantemente — priorizar rendimiento en Android. |
| Frontend web (panel coordinador/institucional) | React + TypeScript | Reutilización de componentes, ecosistema maduro para dashboards. |
| Backend | Node.js (NestJS) o similar, API REST/GraphQL | Rapidez de desarrollo para MVP, buena disponibilidad de talento. |
| Base de datos | PostgreSQL | Necesidad de integridad relacional fuerte (excursiones, perfiles, inscripciones) + soporte para *append-only logs* de auditoría. |
| Almacenamiento de archivos/imágenes | S3-compatible (AWS S3 o equivalente) | Fotos de excursiones, documentos futuros. |
| Notificaciones | Push (FCM/APNs) + integración WhatsApp Business API + fallback SMS | Dado que hoy el 100% de la coordinación es por WhatsApp, no reemplazarlo de golpe. |
| Autenticación | Teléfono + OTP (no depender de correo electrónico) | Adultos mayores no siempre tienen correo activo; el teléfono es el identificador natural en este contexto. |
| Hosting | Cloud (AWS/GCP) con foco en costo bajo — el proyecto es gratuito para el usuario, financiado por el sponsor | Debe mantenerse económicamente viable ya que no hay monetización directa del usuario final. |

### 4.2 Integraciones necesarias en el MVP

- **WhatsApp Business API**: envío de notificaciones de inscripción, confirmación, cancelación — canal primario de respaldo dado el hábito actual de la comunidad.
- **SMS gateway** (fallback si WhatsApp no está disponible/vinculado): confirmaciones críticas (cancelación de excursión el mismo día).
- **Mapas** (Google Maps o Mapbox): visualización de ruta y accesibilidad de punto de encuentro — *no crítico para v1*, puede diferirse a Fase 2 si el tiempo aprieta.

### 4.3 Notificaciones — arquitectura mínima

El sistema de notificaciones debe soportar 3 canales configurables por usuario: push nativo (si tiene la app instalada), WhatsApp (si vinculó su número), SMS (fallback universal). Prioridad: push > WhatsApp > SMS, con reintento automático al siguiente canal si el anterior falla o no hay confirmación de entrega en X minutos.

### 4.4 Datos sensibles y privacidad

- Los datos de salud (Épica A2) se consideran datos sensibles bajo la legislación mexicana de protección de datos personales (LFPDPPP) y deben:
  - Cifrarse en reposo (encryption at rest) y en tránsito (TLS).
  - Tener control de acceso granular a nivel de campo (no solo a nivel de registro) — el coordinador ve resumen, no el detalle clínico completo, salvo que se apruebe explícitamente.
  - Incluir aviso de privacidad simplificado, visible antes de la captura.
  - Nunca exponerse en el dashboard institucional (Épica D) de forma individual — solo agregada/anonimizada.
- Autenticación con protección contra suplantación de coordinadores (validación manual, Épica A3).

### 4.5 Integridad de registros (anti-borrado institucional)

Dado que el problema #2 del proyecto es el borrado deliberado de registros por terceros, el MVP debe implementar, desde el modelo de datos:
- Tablas de eventos **append-only** para excursiones (no `UPDATE`/`DELETE` directos; cambios = nuevos registros con referencia al anterior).
- Cada registro con autor (user_id), timestamp de servidor (no confiar en timestamp de cliente) y, idealmente, un hash de contenido para detectar alteraciones.
- Backups regulares fuera de la infraestructura que controla cualquier entidad de gobierno local (para el caso de que se busque presionar el borrado).

### 4.6 Consideraciones de conectividad

Iztapalapa tiene zonas de conectividad limitada. El panel de check-in del coordinador (B3/Flujo 4) debe funcionar en modo offline-first básico: permitir marcar asistencia sin conexión y sincronizar cuando vuelva la señal, para no depender de datos móviles en el momento crítico del traslado.

### 4.7 Escalabilidad y multi-tenant (pensando en el modelo de negocio)

Como el modelo de negocio es licenciar la plataforma a entidades financieras para replicarla en otras comunidades (no solo Iztapalapa), el modelo de datos del MVP debe diseñarse **multi-tenant desde el inicio** (aislamiento de datos por organización/comunidad), aunque el MVP solo tenga un tenant activo (COPACO Iztapalapa). Retrofit de multi-tenancy después del MVP es costoso — vale la pena la inversión inicial.

---

## 5. Success Metrics (KPIs)

### 5.1 Métricas de impacto humano (las que justifican el proyecto ante cualquier sponsor)

| KPI | Meta MVP (primeros 6 meses) |
|---|---|
| Incidentes de traslado (caídas, emergencias médicas no atendidas) reportados en excursiones gestionadas vía la app | Reducción medible frente a línea base histórica (a establecer con COPACO) — meta cualitativa inicial: 0 incidentes graves en excursiones 100% gestionadas por la plataforma |
| % de inscripciones con perfil de salud completo antes de la excursión | ≥ 80% |
| % de excursiones con alerta de accesibilidad mostrada y no ignorada (usuario confirmó con acompañante) | ≥ 90% de alertas resultan en acción (acompañante confirmado o cancelación) |

### 5.2 Métricas de adopción

| KPI | Meta MVP |
|---|---|
| Adultos mayores con perfil creado | 500 en los primeros 3 meses (piloto en 5-10 colonias) |
| Coordinadores COPACO activos (crearon ≥1 excursión) | 30+ (de 12,000 voluntarios totales, iniciando con un subconjunto piloto) |
| Excursiones publicadas por mes | 15-20 al mes 3 |
| Tasa de adopción vs. WhatsApp (excursiones gestionadas 100% en plataforma vs. mixtas) | 60% para el mes 6 |

### 5.3 Métricas de calidad de producto

| KPI | Meta MVP |
|---|---|
| Tasa de no-show (inscritos que no asisten sin cancelar) | Reducción del 20% frente a la gestión manual por WhatsApp (medido cualitativamente por COPACO en el piloto) |
| Tiempo promedio para crear una excursión (coordinador) | < 5 minutos |
| Tiempo promedio para inscribirse (adulto mayor o familiar) | < 2 minutos |
| Entrega exitosa de notificaciones (push+WhatsApp+SMS combinados) | ≥ 95% |

### 5.4 Métricas para el comprador (entidad financiera / sponsor)

| KPI | Uso |
|---|---|
| Usuarios activos mensuales (MAU) por comunidad piloto | Reporte de impacto social trimestral |
| Costo por adulto mayor atendido (infraestructura / usuarios activos) | Justificación de ROI social del patrocinio |
| Número de comunidades adicionales interesadas en adoptar la plataforma (pipeline de expansión) | Justificación de escalabilidad del modelo de licenciamiento |

---

## 6. Implementation Roadmap

### Fase 0 — Fundacional (Semanas 1-3)
- Definición final de modelo de datos multi-tenant (4.7).
- Setup de infraestructura base (backend, DB, autenticación por teléfono/OTP).
- Diseño de UI validado con 3-5 usuarios reales de COPACO (Doña Elena / Don Raúl personas) — usability testing temprano, no al final.

### Fase 1 — MVP núcleo: Turismo Comunitario (Semanas 4-10)
**Prioridad máxima — esto es lo que se demuestra al sponsor.**
- Épica A completa (registro adulto mayor, perfil de salud, registro coordinador con validación).
- Épica B completa (crear, inscribir, panel de participantes, cancelar/reprogramar).
- Notificaciones básicas: push + WhatsApp (SMS puede diferirse si hay presión de tiempo, pero es recomendable incluirlo desde el MVP dado el perfil de usuario).
- Integridad de registros básica (C1) — se construye junto con B, no después, porque el modelo de datos append-only debe estar desde el diseño inicial de la tabla de excursiones.

### Fase 2 — Panel institucional y piloto medible (Semanas 11-14)
- Épica D (dashboard institucional).
- Instrumentación completa de KPIs (sección 5).
- Piloto real con 5-10 colonias de Iztapalapa, recolección de métricas de línea base.

### Fase 3 — Post-MVP (posterior al piloto, condicionado a resultados)
No incluido en el MVP pero documentado para roadmap del producto:
- Repositorio documental verificable completo (actas, solicitudes de infraestructura, censura automática de datos personales antes de publicación).
- Buzón de sugerencias interpretado por IA.
- Directorio de 30+ servicios comunitarios.
- Modo offline-first extendido a más pantallas (no solo check-in).
- Expansión multi-comunidad (activar multi-tenancy para nuevas alcaldías/comunidades bajo el modelo de licenciamiento a entidades financieras).

### Dependencias críticas a resolver antes de Fase 1
- Acceso a WhatsApp Business API (verificación de cuenta puede tardar semanas — iniciar trámite en Fase 0).
- Validación legal del tratamiento de datos de salud (LFPDPPP) — revisar con asesoría legal antes de lanzar Épica A2 a producción real con datos de adultos mayores.
- Acuerdo con COPACO sobre quién es "administrador" con permisos de validar coordinadores (Épica A3) — esto es un proceso humano, no solo técnico, y debe definirse antes de que el sistema lo requiera.

---

## Notas para el equipo de desarrollo

- Este PRD asume personas, insights de usuario y modelo de negocio **generados/asumidos** por no contar aún con investigación de campo formal ni con un archivo `aguila-viajera-mvp.md` de scope previo — se recomienda validar las personas (sección 1.3) con entrevistas reales a COPACO antes de congelar el diseño final de UI.
- El repositorio documental y el canal ciudadano (capas 2 y 3 de la visión original del proyecto) están **fuera de este MVP** intencionalmente — el MVP debe poder demostrar valor e impacto humano medible con una sola capa (Turismo Comunitario) antes de justificar inversión en las siguientes.
- Cualquier ticket derivado de este documento debe conservar la trazabilidad a la épica/historia de usuario correspondiente (ej. "B2-AC1") para mantener cobertura completa de criterios de aceptación.
