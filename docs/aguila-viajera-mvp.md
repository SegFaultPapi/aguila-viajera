# MVP Scope: Águila Viajera
*Plataforma digital comunitaria para COPACO — Iztapalapa, CDMX*

---

## 🎯 Problema Core
COPACO coordina excursiones de vida o muerte para adultos mayores usando solo WhatsApp, sin registro de salud ni trazabilidad — y el gobierno borra sus registros apropiándose de su trabajo. La plataforma resuelve los tres con web app, blockchain verificable y asistente IA.

---

## 🔥 Flujo MVP (8 pasos)

1. **Usuario llega a la web** → el chatbot IA lo recibe y lo orienta: ¿eres adulto mayor, familiar o voluntario COPACO?
2. **Usuario se registra con Privy** — correo electrónico o número de teléfono; sin contraseña, sin wallet. El adulto mayor puede hacerlo solo o con ayuda de un familiar
3. **Voluntario COPACO crea una excursión** — lugar, fecha, cupo, accesibilidad y requisitos médicos desde su celular
4. **Inscripción a la excursión** — el adulto mayor se inscribe por sí solo, o un familiar vinculado a su cuenta lo hace en su nombre
5. **Perfil de salud completo antes de la excursión** — lo llena el propio adulto mayor, un familiar desde su cuenta, o cargando datos existentes. Campos: movilidad, condición cognitiva, medicamentos, contacto de emergencia
6. **Voluntario confirma inscripciones** — lista consolidada con alertas de salud por participante
7. **Sistema genera el acta digital** — hash SHA-256 → IPFS → registrado en Ethereum mainnet con firma wallet institucional COPACO
8. **Verificación pública** — cualquier persona ingresa el ID del acta y confirma en Ethereum: quién lo creó, cuándo y que el documento es íntegro

---

## ✅ Features MVP

- **Web app responsive (mobile-first)** — sin instalación, funciona desde cualquier navegador
- **Auth con Privy** — acceso por correo electrónico o número de teléfono; sin contraseña ni wallet; flujo de un solo paso accesible para adultos mayores
- **Cuenta de usuario con gestión de familiares** — desde su perfil, el adulto mayor puede vincular uno o más familiares; el familiar vinculado puede actuar en nombre del adulto mayor (inscribirse, editar perfil de salud)
- **Inscripción autónoma a excursiones** — el adulto mayor puede inscribirse por sí solo; si necesita ayuda, un familiar vinculado puede hacerlo desde su propia cuenta
- **Perfil de salud flexible** — puede ser llenado por el propio adulto mayor, por un familiar vinculado, o cargando datos previos; campos: movilidad, condición cognitiva, medicamentos, acompañante requerido, contacto de emergencia
- **Gestión de excursiones** — crear, publicar y cerrar con campos de lugar, cupo, accesibilidad y requisitos médicos
- **Panel del voluntario** — lista de participantes con alertas de salud y generación de acta en PDF
- **Chatbot IA (Claude API)** — orienta al usuario según su rol, guía inscripciones y llenado de perfil de salud paso a paso, responde preguntas frecuentes de COPACO y escala a humano si es necesario
- **Blockchain layer (invisible al usuario)** — smart contract `DocumentRegistry` en Ethereum mainnet; wallet institucional COPACO (Gnosis Safe multisig) firma cada acta; verificador público por ID en Etherscan
- **Landing pública** — qué es COPACO + próximas excursiones + verificador de documentos + chatbot

---

## 🛠️ Stack Técnico

| Capa | Tecnología |
|---|---|
| Frontend | React — web app responsive mobile-first |
| Blockchain | Ethereum mainnet |
| Smart contract | Solidity — `DocumentRegistry` |
| Almacenamiento docs | IPFS + hash on-chain |
| Wallet institucional | Gnosis Safe multisig (solo COPACO firma) |
| Backend | Node.js + Supabase |
| Chatbot IA | Claude API (`claude-sonnet-4-6`) |
| Auth | Privy — correo o número de teléfono, sin contraseña ni wallet |

---

## ❌ NO va en MVP

- Directorio de 30+ servicios comunitarios
- Migración de actas históricas a blockchain
- Módulo de solicitudes de infraestructura a la alcaldía
- Notificaciones push / email automáticos
- Sistema de reprogramación y cancelaciones complejas
- Multi-wallet para voluntarios individuales
- NFTs o tokenización de documentos
- App instalable (PWA)

---

## 🎊 Criterio de Éxito

Mi MVP funciona si: **un adulto mayor puede registrarse, completar su perfil de salud e inscribirse a una excursión por sí solo — o con ayuda de un familiar vinculado a su cuenta — sin necesitar asistencia humana de COPACO, y el voluntario puede generar el acta con un link de Etherscan que prueba que el documento es de COPACO e intacto.**

---

## ✅ Test Final

- [ ] **Test de 30 segundos:** Web app donde adultos mayores entran con su correo o teléfono, se inscriben a excursiones con su perfil de salud (solos o con un familiar vinculado), COPACO gestiona todo y genera actas verificables en Ethereum — con chatbot que guía cada paso.
- [ ] **Test de enfoque:** 7 features críticas. ✅
- [ ] **Test de problema:** Resuelve autonomía del adulto mayor + coordinación segura de excursiones + autoría institucional inviolable. ✅

---

## 🚨 Riesgo Principal

**Gas fees de Ethereum mainnet:** cada acta registrada cuesta entre $5–20 USD según congestión de red. COPACO necesita una wallet fondeada con ETH para operar. Definir antes del lanzamiento quién fondea la wallet institucional (alcaldía, donantes, fondos de impacto social).

---

## 💡 Decisiones Clave de Diseño

- **Privy como auth:** correo o teléfono, sin contraseña ni wallet — el acceso más simple posible para adultos mayores con poca experiencia digital
- **El adulto mayor es el actor principal:** puede hacer todo solo; el familiar es un apoyo opcional, no un intermediario obligatorio
- **Familiar vinculado desde la cuenta del adulto mayor:** el vínculo lo crea el propio usuario, no COPACO — mantiene autonomía y privacidad
- **Perfil de salud como objeto compartido:** lo puede llenar el adulto mayor, su familiar, o cargar desde datos previos — siempre editable antes de cada excursión
- Los adultos mayores y voluntarios **no tocan wallets ni cripto** — el blockchain es invisible para el usuario final
- El chatbot es el **punto de entrada y acompañamiento** en cada paso crítico: registro, inscripción y perfil de salud
- Cada acta generada es evidencia de autoría de COPACO **desde el día 1**, construyendo el repositorio documental progresivamente

---

*Proyecto: Águila Viajera — COPACO, Iztapalapa, CDMX*
