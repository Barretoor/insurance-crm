import { prisma } from "@/lib/prisma";
import type { MessageDirection } from "@/generated/prisma/enums";

export type ConversationSummary = {
  id: string;
  name: string;
  phone: string | null;
  lastBody: string;
  lastDirection: MessageDirection;
  lastAt: string;
  unread: number;
};

export type UnmatchedConversation = {
  number: string;
  lastBody: string;
  lastAt: string;
  unread: number;
};

export async function getConversations(agencyId: string) {
  const contacts = await prisma.contact.findMany({
    where: { agencyId, messages: { some: {} } },
    select: {
      id: true,
      name: true,
      phone: true,
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { body: true, direction: true, createdAt: true },
      },
      _count: {
        select: { messages: { where: { direction: "INBOUND", read: false } } },
      },
    },
  });

  const conversations: ConversationSummary[] = contacts.map((contact) => {
    const last = contact.messages[0];
    return {
      id: contact.id,
      name: contact.name,
      phone: contact.phone,
      lastBody: last.body,
      lastDirection: last.direction,
      lastAt: last.createdAt.toISOString(),
      unread: contact._count.messages,
    };
  });
  conversations.sort((a, b) => b.lastAt.localeCompare(a.lastAt));

  // Texts from numbers that don't match any contact (always inbound).
  const orphanMessages = await prisma.message.findMany({
    where: { agencyId, contactId: null },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { fromNumber: true, body: true, createdAt: true, read: true },
  });

  const unmatchedByNumber = new Map<string, UnmatchedConversation>();
  for (const message of orphanMessages) {
    const existing = unmatchedByNumber.get(message.fromNumber);
    if (existing) {
      if (!message.read) existing.unread += 1;
      continue;
    }
    unmatchedByNumber.set(message.fromNumber, {
      number: message.fromNumber,
      lastBody: message.body,
      lastAt: message.createdAt.toISOString(),
      unread: message.read ? 0 : 1,
    });
  }

  return { conversations, unmatched: [...unmatchedByNumber.values()] };
}
