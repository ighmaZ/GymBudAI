import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "./generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL!;
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// In development, save to global
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
