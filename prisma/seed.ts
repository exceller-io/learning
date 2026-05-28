import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter } as any);
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD

async function main() {

  const adminPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD!, 12);
  await db.user.upsert({
    where: { email: "admin@exceller.io" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@exceller.io",
      hashedPassword: adminPassword,
      role: "ADMIN",
    },
  });

  console.log("✅ Seed complete!");
  console.log("\nAdmin Account:");
  console.log("  Admin:      admin@exceller.io      / admin123!");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
