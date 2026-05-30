import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter } as any);
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD
const DEFAULT_AUTHOR_PASSWORD = process.env.DEFAULT_AUTHOR_PASSWORD
const DEFAULT_STUDENT_PASSWORD = process.env.DEFAULT_STUDENT_PASSWORD

async function main() {
  // admin 
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

  // default author
  const authorPassword = await bcrypt.hash(DEFAULT_AUTHOR_PASSWORD!, 12);
  await db.user.upsert({
    where: { email: "ram@exceller.io" },
    update: {},
    create: {
      name: "Ram Gopinathan",
      email: "ram@exceller.io",
      hashedPassword: authorPassword,
      role: "AUTHOR",
    },
  });

  // demo student
  const studentPassword = await bcrypt.hash(DEFAULT_STUDENT_PASSWORD!, 12)
  await db.user.upsert({
    where: { email: "student@exceller.io" },
    update: {},
    create: {
      name: "Demo Student",
      email: "student@exceller.io",
      hashedPassword: studentPassword,
      role: "STUDENT",
    },
  });

  console.log("✅ Seed complete!");
  console.log("\nAdmin Account:");
  console.log("  Admin:      admin@exceller.io      / admin123!");
  console.log("\nAuthor Account:");
  console.log("  Author:      ram@exceller.io      / author123!");
  console.log("\nStudent Account:");
  console.log("  Student:      student@exceller.io      / student123!");
  
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
