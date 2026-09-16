import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// DATABASE_URL must point at Supabase's *transaction*-mode pooler (port
// 6543, ?pgbouncer=true) - that's what allows far more concurrent app
// connections (200 clients here) than the session-mode pooler, which caps
// clients at the same small backend pool_size (15) and was the real cause
// of a "max clients reached" outage. Still capping our own pg pool per
// instance to a modest size - Supavisor already does the real pooling, and
// many concurrent serverless instances add up fast otherwise.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  max: 5,
});

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
