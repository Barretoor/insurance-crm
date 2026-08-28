import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { formatDateTime } from "@/lib/call-labels";
import { EmptyState } from "@/components/empty-state";

type ConversationRow = {
  key: string;
  title: string;
  subtitle?: string;
  href?: string;
  lastBody: string;
  lastAt: Date;
  unreadCount: number;
};

export default async function MensajesPage() {
  const session = await requireSession();

  // Most recent 300 messages is plenty to build an up-to-date conversation
  // list for a single agency without a raw "group by contact, latest row" query.
  const messages = await prisma.message.findMany({
    where: { agencyId: session.user.agencyId },
    orderBy: { createdAt: "desc" },
    take: 300,
    include: { contact: { select: { id: true, name: true, phone: true } } },
  });

  const conversations = new Map<string, ConversationRow>();
  const unmatched = new Map<string, ConversationRow>();

  for (const message of messages) {
    const isUnread = message.direction === "INBOUND" && !message.read;
    const target = message.contactId ? conversations : unmatched;
    const key = message.contactId ?? message.fromNumber;

    const existing = target.get(key);
    if (existing) {
      if (isUnread) existing.unreadCount += 1;
      continue;
    }

    target.set(key, {
      key,
      title: message.contact?.name ?? message.fromNumber,
      subtitle: message.contact?.phone ?? undefined,
      href: message.contact ? `/contacts/${message.contact.id}` : undefined,
      lastBody: message.body,
      lastAt: message.createdAt,
      unreadCount: isUnread ? 1 : 0,
    });
  }

  const conversationRows = [...conversations.values()];
  const unmatchedRows = [...unmatched.values()];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium text-gray-900 tracking-tight">Mensajes</h1>
        <p className="mt-1 text-sm text-gray-500">
          Conversaciones de SMS con tus contactos.
        </p>
      </div>

      {conversationRows.length === 0 && unmatchedRows.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Sin mensajes todavía"
          description="Cuando envíes o recibas un SMS con un contacto, la conversación va a aparecer aquí."
        />
      ) : (
        <>
          {conversationRows.length > 0 && (
            <section className="space-y-2">
              {conversationRows.map((row) => (
                <ConversationCard key={row.key} row={row} />
              ))}
            </section>
          )}

          {unmatchedRows.length > 0 && (
            <section className="space-y-3">
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Sin contacto asociado
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Mensajes (siempre entrantes) de números que no coinciden con
                  ningún contacto registrado.
                </p>
              </div>
              <div className="space-y-2">
                {unmatchedRows.map((row) => (
                  <ConversationCard key={row.key} row={row} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function ConversationCard({ row }: { row: ConversationRow }) {
  const content = (
    <div className="flex items-center justify-between gap-3 rounded-md border border-gray-200 p-4 transition-colors hover:bg-gray-50">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-gray-900">{row.title}</p>
          {row.unreadCount > 0 && (
            <span className="flex h-5 min-w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent-600 px-1 text-[11px] font-medium text-white">
              {row.unreadCount > 99 ? "99+" : row.unreadCount}
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-sm text-gray-500">{row.lastBody}</p>
      </div>
      <div className="flex-shrink-0 text-right">
        <p className="text-xs text-gray-400">{formatDateTime(row.lastAt)}</p>
        {!row.href && (
          <Link
            href={`/contacts/new?phone=${encodeURIComponent(row.key)}`}
            onClick={(e) => e.stopPropagation()}
            className="mt-1 inline-block text-xs font-medium text-accent-700 hover:underline"
          >
            Crear contacto
          </Link>
        )}
      </div>
    </div>
  );

  return row.href ? (
    <Link href={row.href} className="block">
      {content}
    </Link>
  ) : (
    <div>{content}</div>
  );
}
