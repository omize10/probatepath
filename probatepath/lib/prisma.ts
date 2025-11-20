import "server-only";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const shouldInit = Boolean(process.env.DATABASE_URL);

function createPrismaClient() {
  return new PrismaClient({
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
