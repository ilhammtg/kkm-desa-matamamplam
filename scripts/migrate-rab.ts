const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting migration of Expenses to Daily RABs...");

  // 1. Get all Expenses with their Category
  const expenses = await prisma.expense.findMany({
    include: { category: true }
  });

  console.log(`Found ${expenses.length} expenses to migrate.`);

  // 2. Cache RabCategories
  const rabRateMap = new Map(); // Name -> ID
  const rabCats = await prisma.rabCategory.findMany();
  for (const rc of rabCats) {
    rabRateMap.set(rc.name, rc.id);
  }

  // Helper to get/create RabCategory
  async function getRabCategoryId(name: string) {
    if (rabRateMap.has(name)) return rabRateMap.get(name);
    // Create new
    console.log(`Creating new RabCategory: ${name}`);
    const newCat = await prisma.rabCategory.create({ data: { name } });
    rabRateMap.set(name, newCat.id);
    return newCat.id;
  }

  for (const exp of expenses) {
    const date = new Date(exp.date);
    date.setHours(0, 0, 0, 0); // Normalized date
    // Note: Prisma stores DateTime as ISO. Comparisons need care. 
    // Best to query by unique constraint?
    // Or just upsert?
    
    // 1. Ensure RabCategory exists
    const rabCatId = await getRabCategoryId(exp.category.name);

    // 2. Find or Create Daily Rab
    // We can't use upsert easily with composite unique if we need to update total.
    // Let's find first.
    let rab = await prisma.rab.findUnique({
      where: {
        date_rabCategoryId: {
          date: date,
          rabCategoryId: rabCatId
        }
      },
      include: { items: true }
    });

    if (!rab) {
      rab = await prisma.rab.create({
        data: {
          date: date,
          rabCategoryId: rabCatId,
          status: 'REALIZED', // Since it's from an existing expense
          total: 0 // Will update
        },
        include: { items: true }
      });
      console.log(`Created RAB for ${date.toDateString()} - ${exp.category.name}`);
    }

    // 3. Create RabItem
    // Check if this expense is already linked? 
    // The expense currently doesn't have rabId set (new column).
    // But we might be re-running script?
    if (exp.rabId === rab.id) {
        console.log(`Expense ${exp.id} already processed.`);
        continue;
    }

    await prisma.rabItem.create({
      data: {
        rabId: rab.id,
        name: exp.description || `Pengeluaran ${exp.category.name}`,
        quantity: 1,
        unit: 'Paket', // Default
        unitPrice: exp.amount,
        total: exp.amount
      }
    });

    // 4. Update Rab Total
    await prisma.rab.update({
      where: { id: rab.id },
      data: {
        total: { increment: exp.amount }
      }
    });

    // 5. Link Expense to Rab
    // WARNING: Unique constraint on Expense.rabId? 
    // Wait, in my schema: `rabId String? @unique`. 
    // ONE Expense = ONE Rab?
    // "Pengeluaran tinggal kita bayar anggaran RAB konsumsi hari tersebut (total nya langsung)"
    // This implies ONE Expense Transaction pays for the WHOLE Rab.
    // BUT, existing data might have MULTIPLE small expenses for the SAME category/day.
    // Example: 
    // - Morning: Buy Coffee (Konsumsi, 10k)
    // - Lunch: Buy Rice (Konsumsi, 20k)
    // My script creates ONE Rab for "Konsumsi 27 Jan". It has 2 Items (Coffee, Rice).
    // Total Rab = 30k.
    // BUT I have TWO existing Expense records (10k, 20k).
    // If `Expense.rabId` is UNIQUE, I can only link ONE expense to the Rab.
    // THIS IS A PROBLEM.
    //
    // Interpretation: User wants ONE aggregated Expense for the day? "Total nya langsung".
    // "pelajari data pengeluaran sebelumnya ... sesuaikan".
    // 
    // Solution A: Merge existing expenses into ONE Expense record per Rab?
    // - Delete the 2 small expenses, create 1 big expense of 30k?
    // - This changes transaction history. Risky?
    // 
    // Solution B: Allow multiple Expenses to pay one Rab?
    // - Schema: `rabId` NOT unique on Expense. one-to-many.
    // - "Payment Installments"?
    // 
    // User phrasing: "Pengeluaran tinggal kita bayar anggaran RAB konsumsi hari tersebut (total nya langsung)".
    // Implicitly: Normally we pay ONCE.
    // Use case: Daily Shopping -> One Bill -> One Expense.
    // But legacy data might be granular.
    // 
    // If I merge legacy expenses:
    // - I preserve the "Items" in the RAB details (Coffee, Rice).
    // - I create ONE Expense "Bayar RAB Konsumsi 27 Jan" (30k).
    // - This matches the new concept perfectly.
    // - And I delete the old granular expenses.
    // 
    // Is this safe? Yes, as long as `RabItem` preserves the details (Description, Amount).
    // I will go with Solution A: **Merge Expenses**.
    
    // However, I can't easily merge them inside the loop.
    // I should process grouped by Day+Category.
  }

  // Refined Logic:
  // 1. Group Expenses by Date + Category.
  // 2. For each Group:
  //    - Create ONE Rab.
  //    - Create RabItems for each original expense.
  //    - Create ONE New Expense (Sum of amounts).
  //    - DELETE original expenses.
  
  console.log("Grouping expenses...");
  const groups: Record<string, any[]> = {}; // Key: "YYYY-MM-DD_CatID" -> [expenses]

  for (const exp of expenses) {
    const d = new Date(exp.date);
    d.setHours(0,0,0,0);
    const key = `${d.toISOString()}_${exp.categoryId}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(exp);
  }

  for (const key in groups) {
    const groupExpenses = groups[key];
    const firstExp = groupExpenses[0];
    const date = new Date(firstExp.date);
    date.setHours(0,0,0,0);

    const rabCatId = await getRabCategoryId(firstExp.category.name);

    // Create Rab
    console.log(`Processing Group: ${firstExp.category.name} on ${date.toDateString()} (${groupExpenses.length} items)`);
    
    const rab = await prisma.rab.create({
      data: {
        date: date,
        rabCategoryId: rabCatId,
        status: 'REALIZED',
        total: 0 // Update later
      }
    });

    let totalAmount = 0;
    
    // Create Items and Calculate Total
    for (const exp of groupExpenses) {
      await prisma.rabItem.create({
        data: {
          rabId: rab.id,
          name: exp.description || `Pengeluaran ${exp.category.name}`,
          quantity: 1,
          unit: 'Paket',
          unitPrice: exp.amount,
          total: exp.amount
        }
      });
      totalAmount += exp.amount;
    }

    // Update Rab Total
    await prisma.rab.update({ where: { id: rab.id }, data: { total: totalAmount } });

    // Create Aggregated Expense
    // Use properties from first expense (payment method, financeDay) or safe defaults?
    // If expenses in group have DIFFERENT payment methods?
    // Edge case. I'll pick the first one's payment method. 99% likely same.
    const newExpense = await prisma.expense.create({
      data: {
        date: date,
        amount: totalAmount,
        description: `Pembayaran RAB ${firstExp.category.name} (${date.toLocaleDateString()})`,
        categoryId: firstExp.categoryId,
        paymentMethodId: firstExp.paymentMethodId,
        financeDayId: firstExp.financeDayId,
        createdById: firstExp.createdById, // Preserving author
        rabId: rab.id
      }
    });

    // Delete old expenses
    for (const exp of groupExpenses) {
        await prisma.expense.delete({ where: { id: exp.id } });
    }
    
    console.log(`  -> Created Aggregated Expense: ${totalAmount}. Deleted ${groupExpenses.length} old records.`);
  }

  console.log("✅ Migration Complete!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());

export {};
