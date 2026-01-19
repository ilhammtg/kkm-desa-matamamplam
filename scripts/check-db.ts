
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Connecting to database...");
    await prisma.$connect();
    console.log("Connected successfully.");
    const count = await prisma.user.count();
    console.log(`Found ${count} users.`);
    const settings = await prisma.siteSetting.findMany();
    console.log(`Found ${settings.length} site settings.`);
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
