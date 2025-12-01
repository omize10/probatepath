import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";

async function main() {
  try {
    const passwordHash = await bcrypt.hash("supersecurepwd", 12);
    const user = await prisma.user.create({
      data: {
        email: `cli-test-${Date.now()}@example.com`,
        name: "CLI Test",
        passwordHash,
      },
    });
    console.log("created user", user.id);
  } catch (error) {
    console.error("error", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
