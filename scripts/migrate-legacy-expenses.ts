const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting legacy expense migration...");

  // 1. Read JSON Backup
  const backupDir = path.join(__dirname, '..', 'backup');
  const files = fs.readdirSync(backupDir).filter((f: string) => f.startsWith('neon-backup-') && f.endsWith('.json'));
  const latestBackup = files.sort().reverse()[0];
  const filePath = path.join(backupDir, latestBackup);
  console.log(`Reading backup: ${latestBackup}`);
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const oldExpenses = data['expenses'] || [];
  const oldExpenseCats = data['expense_categories'] || [];

  console.log(`Found ${oldExpenses.length} legacy expenses.`);
  
  // Cache Category Names.
  // We need to map Old Expense -> Old ExpenseCategory ID -> Name -> New RabCategory ID
  // But wait, `restore-partial.js` restored `expense_categories` and `rab_categories` using original IDs (JSON backup).
  // So Old IDs == New IDs in DB.
  // `oldExpense.category_id` refers to an ID that EXISTS in `expense_categories` table.
  // We need to find the `ExpenseCategory` record to get its NAME.
  // Then find `RabCategory` with same NAME.

  // Helper map: ExpenseCategoryID -> Name
  const expCatNameMap = new Map();
  // We can fetch from DB since we restored them.
  const allExpCats = await prisma.expenseCategory.findMany();
  for (const c of allExpCats) {
    expCatNameMap.set(c.id, c.name);
  }

  // Helper map: Name -> RabCategory ID
  const rabCatIdMap = new Map();
  const allRabCats = await prisma.rabCategory.findMany();
  for (const c of allRabCats) {
    rabCatIdMap.set(c.name, c.id);
  }

  // Create missing RabCategories if any
  for (const expCat of allExpCats) {
    if (!rabCatIdMap.has(expCat.name)) {
        console.log(`Creating missing RabCategory: ${expCat.name}`);
        const newRC = await prisma.rabCategory.create({ data: { name: expCat.name } });
        rabCatIdMap.set(expCat.name, newRC.id);
    }
  }

  // Group Expenses by Date + Category
  const groups: Record<string, any[]> = {}; // Key: "YYYY-MM-DD_ExpCatID" -> [expenses]

  for (const exp of oldExpenses) {
    // exp.date is string "2026-01-25T..."
    const d = new Date(exp.date);
    d.setHours(0,0,0,0);
    const key = `${d.toISOString()}_${exp.category_id}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(exp);
  }

  // Process Groups
  for (const key in groups) {
    const groupExpenses = groups[key]; // these are raw JSON objects (snake_case keys!)
    const firstExp = groupExpenses[0];

    // Determine Date
    const d = new Date(firstExp.date);
    d.setHours(0,0,0,0); // Matches @db.Date logic hopefully

    // Determine Category
    const catName = expCatNameMap.get(firstExp.category_id);
    if (!catName) {
        console.error(`Unknown category ID ${firstExp.category_id} for expense ${firstExp.id}`);
        continue;
    }
    const rabCatId = rabCatIdMap.get(catName);

    // Create Rab
    // Check if exists? (Idempotency)
    // Actually we wiped DB, so safe to create.
    
    // Note: If multiple groups (same day same category) map to same Rab...
    // My grouping key includes `exp.category_id`. 
    // If I have multiple Expense Categories named "Konsumsi"? (Unlikely due to unique constraint).
    // So "YYYY-MM-DD_ExpCatID" is unique enough.
    
    console.log(`Creating RAB for ${catName} on ${d.toDateString()} (${groupExpenses.length} items)`);

    // Calculate Total
    let totalAmount = 0;
    const itemsData = [];
    
    for (const exp of groupExpenses) {
       totalAmount += exp.amount;
       itemsData.push({
         name: exp.description || `Pengeluaran ${catName}`,
         quantity: 1,
         unit: 'Paket',
         unitPrice: exp.amount,
         total: exp.amount
       });
    }

    const rab = await prisma.rab.create({
      data: {
        date: d,
        rabCategoryId: rabCatId,
        status: 'REALIZED',
        total: totalAmount,
        items: {
            create: itemsData
        }
      }
    });

    // Create Aggregated Expense
    // Needs `categoryId` (ExpenseCategory). This is `firstExp.category_id`.
    // Needs `paymentMethodId`, `financeDayId`.
    // We assume grouping by Date means one `financeDayId`.
    
    await prisma.expense.create({
      data: {
        date: d,
        amount: totalAmount,
        description: `Pembayaran RAB ${catName} (${d.toLocaleDateString('id-ID')})`,
        categoryId: firstExp.category_id,
        paymentMethodId: firstExp.payment_method_id, // snake_case from JSON!
        financeDayId: firstExp.finance_day_id, // snake_case
        createdById: firstExp.created_by_id, // snake_case
        rabId: rab.id
      }
    });
    
    console.log(`  -> Created Aggregated Expense: ${totalAmount}`);
  }

  console.log("✅ Migration Legacy Expenses Complete!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());

export {};
