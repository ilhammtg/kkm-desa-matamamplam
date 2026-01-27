
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Export as a reusable function
export async function seedFinance(prisma: PrismaClient) {
  console.log("Starting finance seed...");

  // 1. Create Payment Methods
  const paymentMethods = ["Cash", "Transfer", "QRIS", "Dana", "OVO", "ShopeePay"];
  const methodMap = new Map<string, string>();

  for (const name of paymentMethods) {
    const pm = await prisma.paymentMethod.upsert({
        where: { name },
        update: {},
        create: { name }
    });
    methodMap.set(name, pm.id);
  }
  console.log("Payment methods seeded.");

  // 2. Create Categories
  const incomeCategories = ["Kas Anggota", "Denda", "Hibah Kampus", "Donasi", "Lainnya"];
  const expenseCategories = ["Konsumsi", "Perlengkapan", "Transportasi", "Cetak/Print", "Obat-obatan", "Lainnya"];

  const incomeCatMap = new Map<string, string>();
  for (const name of incomeCategories) {
    const cat = await prisma.incomeCategory.upsert({
        where: { name },
        update: {},
        create: { name }
    });
    incomeCatMap.set(name, cat.id);
  }

  const expenseCatMap = new Map<string, string>();
  for (const name of expenseCategories) {
    const cat = await prisma.expenseCategory.upsert({
        where: { name },
        update: {},
        create: { name }
    });
    expenseCatMap.set(name, cat.id);
  }
  console.log("Categories seeded.");

  // 3. Create Treasurer User
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash("Bendahara123", salt);

  const treasurer = await prisma.user.upsert({
    where: { email: "bendahara@kkm.local" },
    update: { role: Role.TREASURER },
    create: {
      name: "Bendahara KKM",
      email: "bendahara@kkm.local",
      passwordHash,
      role: Role.TREASURER,
      isActive: true
    }
  });
  console.log("Treasurer user ensure.");

  // 4. Create RAB Categories & RAB
  const rabCatNames = ["Proker", "Konsumsi", "Transportasi", "Posko", "Lainnya"];
  const rabCatMap = new Map<string, string>();
  
  for (const name of rabCatNames) {
      const cat = await prisma.rabCategory.upsert({
          where: { name },
          update: {},
          create: { name }
      });
      rabCatMap.set(name, cat.id);
  }

  // 4. RAB Categories created, RAB items should be created via admin UI
  console.log("RAB categories seeded. RAB items should be created via admin interface.");

  // 5. Create Finance Day (Today)
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const financeDay = await prisma.financeDay.upsert({
      where: { date: today },
      update: {},
      create: {
          date: today,
          status: "OPEN",
          openingBalance: 0
      }
  });

  // 6. Dummy Income & Expense - SKIPPED for Production/Real Use
  // User requested to clear dummy data so treasurer can input real data.
  console.log("Skipping dummy income/expense generation.");

  console.log("Expenses seeded.");
  console.log("Finance seed complete.");
}
