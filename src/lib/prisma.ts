import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let _prisma: PrismaClient | undefined;

export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    if (!_prisma) {
      if (!globalForPrisma.prisma) {
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        const adapter = new PrismaPg(pool);
        globalForPrisma.prisma = new PrismaClient({
          adapter,
          log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
        });
      }
      _prisma = globalForPrisma.prisma;
    }
    const value = Reflect.get(_prisma, prop);
    return typeof value === "function" ? value.bind(_prisma) : value;
  }
});
