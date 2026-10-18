import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { ChatThread } from "@/components/chat-thread";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ contactId: string }>;
}) {
  const session = await requireSession();
  const { contactId } = await params;

  const contact = await prisma.contact.findFirst({
    where: { id: contactId, agencyId: session.user.agencyId },
    select: { id: true, name: true, phone: true, smsOptOut: true },
  });
  if (!contact) notFound();

  // Newest 300, flipped to oldest-first for display.
  const recent = await prisma.message.findMany({
    where: { contactId: contact.id },
    orderBy: { createdAt: "desc" },
    take: 300,
  });
  const messages = recent.reverse();

  // Opening (or sitting on) the thread counts as reading it.
  await prisma.message.updateMany({
    where: { contactId: contact.id, direction: "INBOUND", read: false },
    data: { read: true },
  });

  return (
    <>
      <header className="grid grid-cols-[4rem_1fr_4rem] items-center border-b border-gray-200 px-3 py-3">
        <Link
          href="/mensajes"
          aria-label="Volver a mensajes"
          className="flex items-center text-[#0a84ff] md:invisible"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={2} />
        </Link>
        <div className="min-w-0 text-center">
          <p className="truncate text-[15px] font-semibold text-gray-900">{contact.name}</p>
          {contact.phone && <p className="text-xs text-gray-500">{contact.phone}</p>}
        </div>
        <Link
          href={`/contacts/${contact.id}`}
          className="text-right text-sm font-medium text-[#0a84ff] hover:underline"
        >
          Contacto
        </Link>
      </header>

      <ChatThread
        contactId={contact.id}
        optedOut={contact.smsOptOut}
        initialMessages={messages.map((m) => ({
          id: m.id,
          direction: m.direction,
          body: m.body,
          status: m.status,
          createdAt: m.createdAt.toISOString(),
          automated: m.automationId !== null,
        }))}
      />
    </>
  );
}
