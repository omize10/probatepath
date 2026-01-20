import "server-only";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const datasourceUrl = process.env.DATABASE_URL;
const shouldInit = Boolean(datasourceUrl);
let sharedPool: Pool | null = null;

function createPrismaClient() {
  if (!datasourceUrl) {
    throw new Error("DATABASE_URL must be set to initialize PrismaClient.");
  }
  sharedPool ||= new Pool({
    connectionString: datasourceUrl,
    // SSL required for Supabase and most cloud PostgreSQL providers
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
  });
  const adapter = new PrismaPg(sharedPool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

const prismaInstance = shouldInit ? globalForPrisma.prisma ?? createPrismaClient() : undefined;

if (shouldInit && process.env.NODE_ENV !== "production" && prismaInstance) {
  globalForPrisma.prisma = prismaInstance;
}

export const prisma =
  prismaInstance ??
  (new Proxy(
    {},
    {
      get() {
        throw new Error("Prisma client is not configured. Set DATABASE_URL to enable persistence.");
      },
    },
  ) as PrismaClient);

export const prismaEnabled = shouldInit;
