"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp } from "lucide-react";
import { MESSAGE_STATUS_LABELS } from "@/lib/message-labels";
import { formatChatDay, formatClock } from "@/lib/chat-time";
import { smsLength } from "@/lib/sms-segments";
import type { MessageDirection, MessageStatus } from "@/generated/prisma/enums";

export type ThreadMessage = {
  id: string;
  direction: MessageDirection;
  body: string;
  status: MessageStatus;
  createdAt: string;
  automated: boolean;
};

// A time stamp is shown in the middle of the chat after a pause this long.
const SEPARATOR_GAP_MS = 60 * 60 * 1000;

export function ChatThread({
  contactId,
  initialMessages,
  optedOut,
}: {
  contactId: string;
  initialMessages: ThreadMessage[];
  optedOut: boolean;
}) {
  const router = useRouter();
  // initialMessages is the source of truth (it refreshes from the server);
  // just-sent messages are shown right away until the server copy arrives.
  const [justSent, setJustSent] = useState<ThreadMessage[]>([]);
  const messages = [
    ...initialMessages,
    ...justSent.filter((s) => !initialMessages.some((m) => m.id === s.id)),
  ];

  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastMessageId = messages.at(-1)?.id;

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [lastMessageId]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
  }, [text]);

  async function send() {
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

      setJustSent((prev) => [...prev, { ...data.message, automated: false }]);
      setText("");
      router.refresh();
    } catch {
      setError("No se pudo enviar el mensaje.");
    } finally {
      setPending(false);
    }
  }

  const now = new Date();
  const lastOutboundId = messages.findLast((m) => m.direction === "OUTBOUND")?.id;
  const length = smsLength(text);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={listRef}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-5 py-4"
      >
        {messages.length === 0 ? (
          <p className="m-auto text-sm text-gray-400">
            Sin mensajes todavía. Escribe uno abajo para empezar la conversación.
          </p>
        ) : (
          messages.map((message, index) => {
            const previous = messages[index - 1];
            const next = messages[index + 1];
            const date = new Date(message.createdAt);
            const isOut = message.direction === "OUTBOUND";

            const startsBlock =
              !previous ||
              date.getTime() - new Date(previous.createdAt).getTime() > SEPARATOR_GAP_MS;
            const nextStartsBlock =
              !next ||
              new Date(next.createdAt).getTime() - date.getTime() > SEPARATOR_GAP_MS;
            const endsRun = nextStartsBlock || next.direction !== message.direction;
            const startsRun = startsBlock || previous.direction !== message.direction;

            const failed = message.status === "FAILED" || message.status === "UNDELIVERED";
            const showStatus =
              isOut && (failed || (message.id === lastOutboundId && endsRun));

            return (
              <div key={message.id} className="flex flex-col">
                {startsBlock && (
                  <p className="my-3 text-center text-xs text-gray-400">
                    <span className="font-semibold">{formatChatDay(date, now)}</span>{" "}
                    {formatClock(date)}
                  </p>
                )}
                <div
                  className={`flex flex-col ${isOut ? "items-end" : "items-start"} ${
                    startsRun && !startsBlock ? "mt-2" : "mt-0.5"
                  }`}
                >
                  <div
                    className={`bubble ${isOut ? "bubble-out" : "bubble-in"} ${
                      endsRun ? "bubble-tail" : ""
                    }`}
                  >
                    {message.body}
                  </div>
                  {(showStatus || message.automated) && (
                    <p
                      className={`mt-0.5 px-1 text-[11px] ${
                        failed ? "font-medium text-red-600" : "text-gray-400"
                      }`}
                    >
                      {[
                        showStatus ? MESSAGE_STATUS_LABELS[message.status] : null,
                        message.automated ? "Automático" : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {optedOut ? (
        <p className="border-t border-gray-200 p-3 text-sm text-amber-700">
          Este contacto se dio de baja de mensajes de texto (respondió STOP). No se le pueden
          enviar mensajes hasta que responda START.
        </p>
      ) : (
        <div className="border-t border-gray-200 px-4 pb-2 pt-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
            className="flex items-end gap-2 rounded-3xl border border-gray-300 bg-gray-50 py-1.5 pl-4 pr-1.5 focus-within:border-accent-500"
          >
            <textarea
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              rows={1}
              placeholder="Mensaje de texto"
              className="block max-h-[120px] min-h-[1.75rem] w-full resize-none bg-transparent py-1 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={pending || !text.trim()}
              aria-label="Enviar mensaje"
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#0a84ff] text-white transition-opacity disabled:opacity-40"
            >
              <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </form>
          <p className="mt-1.5 px-2 text-xs text-gray-400">
            {length.length} / {length.capacity} · {length.segments} SMS
            {length.encoding === "UCS-2" && length.length > 0 && " · con acentos o emojis cuenta 70 por SMS"}
          </p>
          {error && <p className="px-2 pt-1 text-sm text-red-700">{error}</p>}
        </div>
      )}
    </div>
  );
}
