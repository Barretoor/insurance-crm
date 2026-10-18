import type { ReactNode } from "react";
import { requireSession } from "@/lib/session";
import { getConversations } from "@/lib/conversations";
import { MessagesShell } from "@/components/messages-shell";

export default async function MensajesLayout({ children }: { children: ReactNode }) {
  const session = await requireSession();
  const { conversations, unmatched } = await getConversations(session.user.agencyId);

  return (
    <MessagesShell conversations={conversations} unmatched={unmatched}>
      {children}
    </MessagesShell>
  );
}
