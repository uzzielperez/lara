import { PrismaClient } from "@/generated/prisma";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient = global.prisma ?? new PrismaClient({
  log: ["error", "warn"],
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "file:./prisma/dev.db"
    }
  }
});

if (process.env.NODE_ENV !== "production") global.prisma = prisma;




