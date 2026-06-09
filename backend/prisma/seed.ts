import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("forge1234", 10);

  await prisma.user.upsert({
    where: {
      email: "dm@forge.local",
    },
    update: {
      name: "Nicolás",
      passwordHash,
    },
    create: {
      name: "Nicolás",
      email: "dm@forge.local",
      passwordHash,
    },
  });

  await prisma.user.upsert({
    where: {
      email: "player@forge.local",
    },
    update: {
      name: "Jugador Demo",
      passwordHash,
    },
    create: {
      name: "Jugador Demo",
      email: "player@forge.local",
      passwordHash,
    },
  });

  console.log("Seed completado.");
  console.log("Usuarios demo:");
  console.log("dm@forge.local / forge1234");
  console.log("player@forge.local / forge1234");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });