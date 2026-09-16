import type { ReactNode } from "react";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getUserAvatarUrl } from "@/lib/user-avatar-url";
import { NavBar } from "@/components/nav-bar";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireSession();

  const [avatarUrl, unreadMessages] = await Promise.all([
    getUserAvatarUrl(session.user.id),
    prisma.message.count({
      where: { agencyId: session.user.agencyId, direction: "INBOUND", read: false },
    }),
  ]);

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <NavBar avatarUrl={avatarUrl} unreadMessages={unreadMessages} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 md:px-8 md:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
