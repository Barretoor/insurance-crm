import { prisma } from "@/lib/prisma";

/**
 * Picks the best "local presence" number from the agency's pool for a given contact:
 * 1. Exact area code match
 * 2. Same state, any area code
 * 3. First active number in the pool
 */
export async function selectLocalPresenceNumber(
  agencyId: string,
  contact: { areaCode: string | null; state: string | null }
) {
  if (contact.areaCode) {
    const exact = await prisma.phoneNumber.findFirst({
      where: { agencyId, active: true, areaCode: contact.areaCode },
    });
    if (exact) return exact;
  }

  if (contact.state) {
    const sameState = await prisma.phoneNumber.findFirst({
      where: { agencyId, active: true, state: contact.state },
    });
    if (sameState) return sameState;
  }

  return prisma.phoneNumber.findFirst({
    where: { agencyId, active: true },
    orderBy: { createdAt: "asc" },
  });
}
