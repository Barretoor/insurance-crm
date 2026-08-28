import type { ReactNode } from "react";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { NavBar } from "@/components/nav-bar";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireSession();

  // Fetched fresh here (not stored in the JWT/session) since avatarUrl can be
  // a sizeable base64 string that must never end up inside the session cookie.
  const [user, unreadMessages] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { avatarUrl: true },
    }),
    prisma.message.count({
      where: { agencyId: session.user.agencyId, direction: "INBOUND", read: false },
    }),
  ]);

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <NavBar avatarUrl={user?.avatarUrl ?? null} unreadMessages={unreadMessages} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 md:px-8 md:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
