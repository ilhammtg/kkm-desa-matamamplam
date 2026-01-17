import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@kkm.local";
  const password = "Admin@12345";

  console.log(`Checking user: ${email}`);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error("❌ User not found!");
    return;
  }

  console.log("✅ User found:", {
    id: user.id,
    email: user.email,
    passwordHash: user.passwordHash,
    role: user.role,
    isActive: user.isActive,
  });

  console.log(`Verifying password: '${password}'`);
  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (isValid) {
    console.log("✅ Password match!");
  } else {
    console.error("❌ Password DOES NOT match!");
    
    // Debug: generate a new hash to compare visually
    const newHash = await bcrypt.hash(password, 10);
    console.log("Expected hash format example:", newHash);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
