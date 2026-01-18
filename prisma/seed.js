// seeding super admin
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "owner@ngo.com";
  const plainPassword = "owner123";

  const hashedPassword = await hash(plainPassword, 10);

  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log("OWNER already exists. Skipping seed.");
    return;
  }

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: "OWNER",
      name: "Owner"
    },
  });

  console.log("OWNER created successfully");
  console.log("Email:", email);
  console.log("Password:", plainPassword);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
