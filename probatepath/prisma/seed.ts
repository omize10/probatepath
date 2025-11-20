import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL?.toLowerCase();
  const password = process.env.SEED_ADMIN_PASS;
  if (!email || !password) {
    console.log("[seed] SEED_ADMIN_EMAIL or SEED_ADMIN_PASS missing, skipping seed.");
    return;
  }

  const existing = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  });
  if (existing) {
    console.log("[seed] Admin already exists, skipping.");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      email,
      name: "Portal Admin",
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log("[seed] Seeded admin user:", email);
}

main()
  .catch((error) => {
    console.error("[seed] Failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
