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

  // Determine if we need SSL (any non-localhost connection)
  const isRemoteDb = !datasourceUrl.includes("localhost") && !datasourceUrl.includes("127.0.0.1");

  sharedPool ||= new Pool({
    connectionString: datasourceUrl,
    // SSL required for Supabase and most cloud PostgreSQL providers
    ssl: isRemoteDb ? { rejectUnauthorized: false } : undefined,
    // Connection pool settings for serverless
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
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
