"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { MESSAGE_STATUS_LABELS } from "@/lib/message-labels";
import type { MessageDirection, MessageStatus } from "@/generated/prisma/enums";

export type ThreadMessage = {
  id: string;
  direction: MessageDirection;
  body: string;
  status: MessageStatus;
  createdAt: string;
};

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("es-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function MessageThread({
  contactId,
  initialMessages,
}: {
  contactId: string;
  initialMessages: ThreadMessage[];
}) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const body = text.trim();
    if (!body || pending) return;

    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId, body }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.error ?? "No se pudo enviar el mensaje.");
        return;
      }

      setMessages((prev) => [...prev, data.message]);
      setText("");
      router.refresh();
    } catch {
      setError("No se pudo enviar el mensaje.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col rounded-md border border-gray-200">
      <div className="flex max-h-[420px] min-h-[160px] flex-col gap-2 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="m-auto text-sm text-gray-400">
            Sin mensajes todavía. Escribe uno abajo para empezar la conversación.
          </p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.direction === "OUTBOUND" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                  message.direction === "OUTBOUND"
                    ? "bg-accent-600 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{message.body}</p>
                <p
                  className={`mt-1 text-[11px] ${
                    message.direction === "OUTBOUND" ? "text-accent-100" : "text-gray-400"
                  }`}
                >
                  {formatTime(message.createdAt)}
                  {message.direction === "OUTBOUND" &&
                    ` · ${MESSAGE_STATUS_LABELS[message.status]}`}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex items-end gap-2 border-t border-gray-200 p-3"
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              formRef.current?.requestSubmit();
            }
          }}
          rows={1}
          placeholder="Escribe un mensaje..."
          className="block w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
        />
        <button
          type="submit"
          disabled={pending || !text.trim()}
          aria-label="Enviar mensaje"
          className="flex flex-shrink-0 items-center justify-center rounded-md bg-accent-600 p-2.5 text-white transition-colors hover:bg-accent-700 disabled:opacity-60"
        >
          <Send className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </form>
      {error && <p className="px-3 pb-3 text-sm text-red-700">{error}</p>}
    </div>
  );
}
