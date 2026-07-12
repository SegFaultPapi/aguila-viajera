import { NextRequest, NextResponse } from "next/server";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `Eres el asistente virtual de Águila Viajera, la plataforma digital de COPACO (Comités de Participación Comunitaria) en Iztapalapa, CDMX.

Águila Viajera ayuda a adultos mayores a inscribirse a excursiones comunitarias seguras, completar su perfil de salud, y a los coordinadores COPACO a gestionar las excursiones.

Tu misión:
- Orientar al usuario según su rol (adulto mayor, familiar cuidador o coordinador COPACO)
- Guiar inscripciones a excursiones paso a paso
- Ayudar a completar el perfil de salud
- Responder preguntas frecuentes sobre COPACO y la plataforma
- Escalar a un coordinador humano si la situación lo requiere

Roles en la plataforma:
1. Adulto mayor (ej. Doña Elena): Se inscribe a excursiones, ve alertas de accesibilidad, tiene perfil de salud
2. Familiar cuidador (ej. Ana): Puede gestionar el perfil de salud del adulto mayor e inscribirlo
3. Coordinador COPACO (ej. Raúl): Crea excursiones, ve la lista de participantes, hace check-in el día del evento

Secciones disponibles en la app:
- Excursiones: Ver y filtrar salidas disponibles
- Mi información / Perfil de salud: Movilidad, medicamentos, contacto de emergencia
- Nueva excursión: Crear una excursión (solo coordinadores)

Reglas de comunicación:
- Habla siempre en español, con lenguaje claro y simple, sin anglicismos
- Sé cálido, paciente y accesible — muchos usuarios son adultos mayores
- Respuestas breves (2-4 oraciones) salvo que el usuario pida más detalle
- Si el usuario parece confundido, ofrece opciones concretas con lenguaje directivo
- Si no sabes algo, di que puede consultar directamente a su coordinador COPACO`;

function getMockResponse(messages: ChatMessage[]): string {
  const last = messages[messages.length - 1]?.content?.toLowerCase() ?? "";

  if (/^(hola|buenos días|buenas tardes|buenas noches|hey|saludos|buen día)/.test(last)) {
    return "¡Hola! Soy el asistente de Águila Viajera. Estoy aquí para ayudarte con excursiones, tu perfil de salud o cualquier duda sobre la plataforma. ¿Eres adulto mayor, familiar o coordinador COPACO?";
  }

  if (/inscrib|unirme|apuntarme|registrarme en una excursión/.test(last)) {
    return "Para inscribirte a una excursión, entra a la sección \"Excursiones\", elige la que te interese y toca el botón \"Inscribirme\". Si tu perfil de salud indica algo importante para esa ruta, verás una alerta antes de confirmar. ¿Quieres que te explique cómo ver las excursiones disponibles?";
  }

  if (/perfil.*(salud|médic)|salud|medicina|medicamento|movilidad|bastón|andadera|silla de ruedas|condición/.test(last)) {
    return "Tu perfil de salud guarda información esencial para tu seguridad: tipo de movilidad, condiciones médicas, medicamentos y contacto de emergencia. Solo lo ven tú, tus familiares autorizados y el coordinador de cada excursión. Lo puedes llenar o actualizar en la sección \"Mi información\".";
  }

  if (/excursion|viaje|destino|salida|tour|paseo/.test(last)) {
    return "En la sección \"Excursiones\" puedes ver todas las salidas disponibles con fecha, cupo y requisitos de accesibilidad. Si alguna ruta no es apta para tu movilidad, la app te avisará antes de inscribirte. ¿Te explico cómo inscribirte a una?";
  }

  if (/coordinador|crear excursión|nueva excursión|publicar|gestionar/.test(last)) {
    return "Como coordinador COPACO, puedes crear una excursión desde el botón \"Nueva\" en la barra de navegación. El proceso tiene 4 pasos: datos básicos, logística y transporte, requisitos de accesibilidad, y revisión final. ¿Tienes alguna duda sobre alguno de esos pasos?";
  }

  if (/cancelar|baja|desinscribir|ya no voy/.test(last)) {
    return "Para cancelar tu inscripción, entra al detalle de la excursión donde estás inscrito y busca la opción de cancelar. Te pedirá confirmar antes de proceder, y el cupo se libera automáticamente para alguien en lista de espera.";
  }

  if (/privacidad|datos|quién ve|quien ve|mis datos|información médica/.test(last)) {
    return "Tus datos de salud son privados y están protegidos. Solo los pueden ver: tú mismo, los familiares que tú autorices, y el coordinador de las excursiones a las que te inscribas. Nunca se comparten con terceros ni se publican en ningún panel.";
  }

  if (/familiar|hijo|hija|mamá|papá|cuidador/.test(last)) {
    return "Como familiar puedes apoyar a tu ser querido completando su perfil de salud e inscribiéndolo a excursiones desde tu cuenta. El vínculo lo crea el propio adulto mayor desde su perfil. ¿Quieres empezar por el perfil de salud o buscar una excursión disponible?";
  }

  if (/adulto mayor|persona mayor|soy mayor|doña|don|abuela|abuelo/.test(last)) {
    return "Perfecto. Como adulto mayor puedes ver las excursiones disponibles, inscribirte y completar tu información de salud para que el coordinador esté preparado si necesitas apoyo. ¿Por dónde quieres empezar?";
  }

  if (/cupo|lugares|disponible|lleno|lista de espera/.test(last)) {
    return "Cada excursión muestra el cupo disponible en tiempo real. Si ya está llena, puedes anotarte en lista de espera y te avisamos si se libera un lugar. El coordinador también puede ampliar el cupo si el transporte lo permite.";
  }

  if (/checkin|check-in|asistencia|lista|dia de la excursion|día de la excursión/.test(last)) {
    return "El día de la excursión, el coordinador marca la asistencia de cada participante desde su celular. Esto genera un registro oficial que queda guardado en la plataforma con fecha y hora para trazabilidad.";
  }

  if (/whatsapp|notificación|aviso|mensaje/.test(last)) {
    return "La plataforma te enviará confirmaciones y avisos importantes. Si tienes dudas urgentes, también puedes comunicarte directamente con tu coordinador COPACO por WhatsApp.";
  }

  if (/ayuda|no entiendo|no sé|qué hago|cómo funciona|empezar/.test(last)) {
    return "Claro, estoy aquí para orientarte. Cuéntame: ¿eres adulto mayor, familiar de alguien en la plataforma o coordinador COPACO? Así te guío mejor según lo que necesitas.";
  }

  if (/gracias|thank|muy bien|perfecto|excelente/.test(last)) {
    return "¡Con mucho gusto! Recuerda que puedo ayudarte con cualquier duda sobre excursiones, tu perfil de salud o el funcionamiento de la plataforma. ¡Buen viaje!";
  }

  return "Entendido. Puedo orientarte con inscripciones a excursiones, tu perfil de salud, o gestión de excursiones si eres coordinador. ¿Qué necesitas exactamente?";
}

export async function POST(request: NextRequest) {
  let messages: ChatMessage[];

  try {
    ({ messages } = await request.json());
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Se requiere al menos un mensaje" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (apiKey) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 400,
          system: SYSTEM_PROMPT,
          messages,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message ?? "Error de API");
      }

      const text: string = data.content?.[0]?.text ?? "Lo siento, no pude procesar tu mensaje.";
      return NextResponse.json({ message: text });
    } catch (err) {
      console.error("[chatbot] Error llamando a Anthropic:", err);
      return NextResponse.json(
        { message: "Lo siento, hubo un problema con el asistente. Intenta de nuevo en un momento." }
      );
    }
  }

  // Mock mode — sin API key
  await new Promise((r) => setTimeout(r, 700));
  return NextResponse.json({ message: getMockResponse(messages) });
}
