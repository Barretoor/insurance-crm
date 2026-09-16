import { cache } from "react";
import { prisma } from "@/lib/prisma";

/**
 * avatarUrl is fetched fresh (not stored in the JWT/session) since it can be
 * a sizeable base64 string that must never end up in the session cookie.
 * Wrapped in React's cache() so the layout and a page that both need it
 * during the same request (e.g. the dashboard header) share one query
 * instead of issuing it twice.
 */
export const getUserAvatarUrl = cache(async (userId: string): Promise<string | null> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarUrl: true },
  });
  return user?.avatarUrl ?? null;
});
