"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/app/api/chat/route";

interface Message extends ChatMessage {
  id: string;
}

const INITIAL_MESSAGE: Message = {
  id: "init",
  role: "assistant",
  content:
    "¡Hola! Soy el asistente de Águila Viajera. Puedo orientarte con excursiones, tu perfil de salud o cualquier duda sobre la plataforma. ¿En qué te ayudo?",
};

const QUICK_REPLIES = [
  "¿Cómo me inscribo a una excursión?",
  "¿Cómo lleno mi perfil de salud?",
  "Soy coordinador COPACO",
];

function SendIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18" aria-hidden>
      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
    </svg>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <img
        src="/images/ui/aguila-bienvenida.png"
        alt=""
        aria-hidden
        width={32}
        height={32}
        style={{ objectFit: "contain", flexShrink: 0 }}
      />
      <div
        className="flex gap-1 px-4 py-3 rounded-2xl"
        style={{
          background: "var(--color-bg-alt)",
          borderRadius: "1.25rem 1.25rem 1.25rem 0.25rem",
        }}
      >
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="block h-2 w-2 rounded-full animate-bounce"
            style={{
              background: "var(--color-ink-soft)",
              animationDelay: `${delay}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  /* Scroll al fondo cuando llega un mensaje nuevo */
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  /* Focus en el input al abrir */
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [isOpen]);

  /* Auto-resize del textarea */
  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
  }

  async function sendMessage(text: string = input.trim()) {
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setShowQuickReplies(false);
    setIsLoading(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const apiMessages: ChatMessage[] = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data: { message: string } = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: data.message,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content:
            "Lo siento, hubo un problema al conectarme. Por favor intenta de nuevo en un momento.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const canSend = input.trim().length > 0 && !isLoading;

  return (
    <>
      {/* ── Panel de chat ─────────────────────────────────── */}
      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Asistente Águila Viajera"
          aria-modal="true"
          className="fixed flex flex-col"
          style={{
            bottom: "136px",
            right: "0.75rem",
            width: "min(360px, calc(100vw - 1.5rem))",
            height: "min(500px, calc(100dvh - 180px))",
            zIndex: 60,
            background: "var(--color-card)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          {/* Header */}
          <div
            className="flex flex-shrink-0 items-center gap-3 px-4 py-3"
            style={{
              background: "var(--color-primary)",
              color: "white",
              borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
            }}
          >
            <img
              src="/images/ui/aguila-bienvenida.png"
              alt=""
              aria-hidden
              width={36}
              height={36}
              style={{ objectFit: "contain", flexShrink: 0 }}
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-sm font-bold leading-tight">Asistente Águila Viajera</span>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.75)" }}>
                COPACO · Iztapalapa, CDMX
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar asistente"
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xl leading-none transition-colors"
              style={{
                background: "rgba(255,255,255,0.15)",
                color: "white",
              }}
            >
              ×
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {msg.role === "assistant" && (
                  <img
                    src="/images/ui/aguila-bienvenida.png"
                    alt=""
                    aria-hidden
                    width={28}
                    height={28}
                    style={{ objectFit: "contain", flexShrink: 0 }}
                  />
                )}
                <div
                  className="max-w-[82%] text-sm leading-relaxed"
                  style={{
                    padding: "0.6rem 0.875rem",
                    background:
                      msg.role === "user" ? "var(--color-primary)" : "var(--color-bg-alt)",
                    color: msg.role === "user" ? "white" : "var(--color-ink)",
                    borderRadius:
                      msg.role === "user"
                        ? "1.25rem 1.25rem 0.25rem 1.25rem"
                        : "1.25rem 1.25rem 1.25rem 0.25rem",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Respuestas rápidas — solo al inicio */}
            {showQuickReplies && !isLoading && (
              <div className="flex flex-wrap gap-2 pt-1">
                {QUICK_REPLIES.map((qr) => (
                  <button
                    key={qr}
                    onClick={() => sendMessage(qr)}
                    className="rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors"
                    style={{
                      borderColor: "var(--color-primary)",
                      color: "var(--color-primary)",
                      background: "var(--color-primary-soft)",
                    }}
                  >
                    {qr}
                  </button>
                ))}
              </div>
            )}

            {isLoading && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className="flex flex-shrink-0 items-end gap-2 border-t px-3 py-3"
            style={{ borderColor: "var(--color-border)" }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu pregunta…"
              rows={1}
              aria-label="Escribe tu mensaje"
              className="flex-1 resize-none rounded-xl border px-3 py-2 text-sm outline-none transition-shadow"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-bg)",
                minHeight: "44px",
                maxHeight: "96px",
                lineHeight: "1.5",
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!canSend}
              aria-label="Enviar mensaje"
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition-colors"
              style={{
                background: canSend ? "var(--color-primary)" : "var(--color-bg-alt)",
                color: canSend ? "white" : "var(--color-ink-soft)",
                cursor: canSend ? "pointer" : "default",
              }}
            >
              <SendIcon />
            </button>
          </div>
        </div>
      )}

      {/* ── Botón flotante (mascota) — visible solo cuando el panel está cerrado ─── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Abrir asistente Águila Viajera"
          className="fixed"
          style={{
            bottom: "76px",
            right: "0.75rem",
            zIndex: 45,
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            width: "52px",
            height: "52px",
            filter: "drop-shadow(0 4px 12px rgba(2,132,199,0.40))",
            transition: "transform 0.15s ease, filter 0.15s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.12)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          }}
        >
          <img
            src="/images/ui/aguila-bienvenida.png"
            alt=""
            aria-hidden
            width={52}
            height={52}
            style={{ objectFit: "contain", display: "block" }}
          />
          {/* Indicador de notificación */}
          <span
            aria-hidden
            className="absolute"
            style={{
              top: 0,
              right: 0,
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: "var(--color-accent)",
              border: "2px solid white",
            }}
          />
        </button>
      )}
    </>
  );
}
