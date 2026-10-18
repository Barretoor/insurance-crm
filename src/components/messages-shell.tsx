"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { AutoRefresh } from "@/components/auto-refresh";
import { formatListStamp } from "@/lib/chat-time";
import type { ConversationSummary, UnmatchedConversation } from "@/lib/conversations";

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function MessagesShell({
  conversations,
  unmatched,
  children,
}: {
  conversations: ConversationSummary[];
  unmatched: UnmatchedConversation[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  const onThread = pathname.startsWith("/mensajes/");
  const activeId = onThread ? pathname.split("/")[2] : null;

  const needle = query.trim().toLowerCase();
  const needleDigits = digitsOnly(query);
  const filtered = needle
    ? conversations.filter(
        (c) =>
          c.name.toLowerCase().includes(needle) ||
          (needleDigits.length > 0 && digitsOnly(c.phone ?? "").includes(needleDigits))
      )
    : conversations;

  const now = new Date();

  return (
    <div className="flex h-[calc(100dvh-6rem)] overflow-hidden rounded-xl border border-gray-200 bg-surface md:h-[calc(100dvh-5rem)]">
      <AutoRefresh />

      <aside
        className={`${onThread ? "hidden md:flex" : "flex"} w-full flex-shrink-0 flex-col border-r border-gray-200 md:w-80`}
      >
        <div className="space-y-3 border-b border-gray-200 px-4 py-3">
          <h1 className="text-lg font-medium tracking-tight text-gray-900">Mensajes</h1>
          <label className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-2">
            <Search className="h-4 w-4 flex-shrink-0 text-gray-400" strokeWidth={1.75} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar nombre o teléfono"
              aria-label="Buscar conversación"
              className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
          </label>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {filtered.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-gray-400">
              {conversations.length === 0
                ? "Sin conversaciones todavía."
                : "No se encontró ninguna conversación."}
            </p>
          )}

          {filtered.map((conversation) => {
            const unread = conversation.unread > 0;
            const active = conversation.id === activeId;
            return (
              <Link
                key={conversation.id}
                href={`/mensajes/${conversation.id}`}
                className={`relative block border-b border-gray-100 py-3 pl-6 pr-4 transition-colors ${
                  active ? "bg-gray-100" : "hover:bg-gray-50"
                }`}
              >
                {unread && (
                  <span
                    className="absolute left-2.5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-[#0a84ff]"
                    aria-label={`${conversation.unread} sin leer`}
                  />
                )}
                <div className="flex items-baseline justify-between gap-2">
                  <p
                    className={`truncate text-[15px] text-gray-900 ${unread ? "font-semibold" : "font-medium"}`}
                  >
                    {conversation.name}
                  </p>
                  <p className="flex-shrink-0 text-xs text-gray-400">
                    {formatListStamp(new Date(conversation.lastAt), now)}
                  </p>
                </div>
                <p
                  className={`mt-0.5 truncate text-sm ${unread ? "text-gray-700" : "text-gray-500"}`}
                >
                  {conversation.lastDirection === "OUTBOUND" && "Tú: "}
                  {conversation.lastBody}
                </p>
              </Link>
            );
          })}

          {unmatched.length > 0 && !needle && (
            <div className="px-4 pb-4 pt-5">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Sin contacto asociado
              </p>
              <div className="mt-2 space-y-2">
                {unmatched.map((item) => (
                  <div key={item.number} className="rounded-md border border-gray-200 p-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900">{item.number}</p>
                      <p className="flex-shrink-0 text-xs text-gray-400">
                        {formatListStamp(new Date(item.lastAt), now)}
                      </p>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-gray-500">{item.lastBody}</p>
                    <Link
                      href={`/contacts/new?phone=${encodeURIComponent(item.number)}`}
                      className="mt-1.5 inline-block text-xs font-medium text-accent-700 hover:underline"
                    >
                      Crear contacto
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      <section
        className={`${onThread ? "flex" : "hidden md:flex"} min-w-0 flex-1 flex-col`}
      >
        {children}
      </section>
    </div>
  );
}
