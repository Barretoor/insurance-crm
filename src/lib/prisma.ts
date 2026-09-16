import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Supabase's Supavisor pooler already does the real connection pooling and
// caps total clients very low (pool_size: 15 on this project) - our own pg
// pool on top of that must stay small, or a handful of concurrent Vercel
// serverless instances (each defaulting to up to 10 connections) can exhaust
// it and start throwing "max clients reached" errors on ordinary page loads.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  max: 3,
});

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
