import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../app/generated/prisma";
import * as bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const adapter = new PrismaLibSql({ url });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existing) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
        name: "Admin",
      },
    });
    console.log("✅ Admin account created:", adminEmail);
  } else {
    console.log("⚠️  Admin account already exists:", adminEmail);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
