import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/app/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrisma() {
  const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const adapter = new PrismaLibSql({ url });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
