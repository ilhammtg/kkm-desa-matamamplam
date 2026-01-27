"use server";

import { prisma } from "@/server/db/prisma";
import { getServerAuthSession } from "@/server/auth/session";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

// --- MIDDLEWARE ---
async function checkTreasurerPermission() {
  const session = await getServerAuthSession();
  if (!session || !session.user) throw new Error("Unauthorized");
  
  if (session.user.role !== Role.TREASURER) {
      throw new Error("Forbidden: Treasurer access only");
  }
  return session.user;
}

// --- MASTER DATA ---
export async function getIncomeCategories() {
    return prisma.incomeCategory.findMany({ orderBy: { name: 'asc' } });
}

export async function getExpenseCategories() {
    return prisma.expenseCategory.findMany({ orderBy: { name: 'asc' } });
}

export async function getPaymentMethods() {
    return prisma.paymentMethod.findMany({ 
        where: { isActive: true },
        orderBy: { name: 'asc' } 
    });
}

export async function getRabCategories() {
    return prisma.rabCategory.findMany({ orderBy: { name: 'asc' } });
}

export async function getMembersForFinance() {
    await checkTreasurerPermission();
    return prisma.member.findMany({
        select: { id: true, name: true, npm: true },
        orderBy: { name: 'asc' }
    });
}

export async function createIncomeCategory(name: string) {
    await checkTreasurerPermission();
    const cat = await prisma.incomeCategory.create({ data: { name } });
    revalidatePath("/dashboard/finance/categories");
    return cat;
}

export async function createExpenseCategory(name: string) {
    await checkTreasurerPermission();
    const cat = await prisma.expenseCategory.create({ data: { name } });
    revalidatePath("/dashboard/finance/categories");
    return cat;
}

export async function deleteIncomeCategory(id: string) {
    await checkTreasurerPermission();
    await prisma.incomeCategory.delete({ where: { id } });
    revalidatePath("/dashboard/finance/categories");
}

export async function deleteExpenseCategory(id: string) {
    await checkTreasurerPermission();
    await prisma.expenseCategory.delete({ where: { id } });
    revalidatePath("/dashboard/finance/categories");
}

// --- FINANCE DAY HELPER ---
async function getOrCreateTodayFinanceDay() {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    let fd = await prisma.financeDay.findUnique({
        where: { date: today }
    });

    if (!fd) {
        fd = await prisma.financeDay.create({
            data: { 
                date: today,
                status: "OPEN",
                openingBalance: 0 
            }
        });
    }
    return fd;
}

// --- INCOME ---
export async function getIncomesGrouped(date?: Date) {
    await checkTreasurerPermission();
    
    // Build where clause
    const where: any = {};
    if (date) {
        // Use full day range in UTC for DateTime fields
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();
        const start = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
        const end = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
        
        where.date = {
            gte: start,
            lte: end
        };
    }

    // Fetch incomes
    const incomes = await prisma.income.findMany({
        where,
        orderBy: { date: 'desc' },
        include: { category: true, member: true, paymentMethod: true }
    });
    
    // Group by category name
    const grouped: Record<string, typeof incomes> = {};
    incomes.forEach(inc => {
        const cat = inc.category.name;
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(inc);
    });

    return grouped;
}

export async function getUnpaidMembers(date: Date) {
    await checkTreasurerPermission();

    const start = new Date(date);
    start.setHours(0,0,0,0);
    const end = new Date(date);
    end.setHours(23,59,59,999);

    // 1. Get "Kas Anggota" category
    const kasCategory = await prisma.incomeCategory.findUnique({
        where: { name: "Kas Anggota" }
    });

    if (!kasCategory) return []; // Or throw error depending on strictness

    // 2. Get all members
    const members = await prisma.member.findMany({
        where: {
            // Optional: filter only active members if you have such filed
        },
        include: {
            position: true
        },
        orderBy: { name: 'asc' }
    });

    // 3. Get all incomes for Kas Anggota on that date
    const paidIncomes = await prisma.income.findMany({
        where: {
            categoryId: kasCategory.id,
            date: {
                gte: start,
                lte: end
            },
            memberId: { not: null } // Ensure bound to member
        },
        select: { memberId: true }
    });

    const paidMemberIds = new Set(paidIncomes.map(i => i.memberId));

    // 4. Filter
    const unpaidMembers = members.filter(m => !paidMemberIds.has(m.id));

    return unpaidMembers;
}

export async function getKasMembersStatus(date: Date) {
    await checkTreasurerPermission();

    const start = new Date(date);
    start.setHours(0,0,0,0);
    const end = new Date(date);
    end.setHours(23,59,59,999);

    // 1. Get "Kas Anggota" category
    const kasCategory = await prisma.incomeCategory.findUnique({
        where: { name: "Kas Anggota" }
    });

    if (!kasCategory) throw new Error("Category 'Kas Anggota' not found");

    // 2. Get all members
    const members = await prisma.member.findMany({
        orderBy: { name: 'asc' },
        include: { position: true }
    });

    // 3. Get paid incomes
    const paidIncomes = await prisma.income.findMany({
        where: {
            categoryId: kasCategory.id,
            date: { gte: start, lte: end },
            memberId: { not: null }
        },
        select: { 
            id: true, 
            memberId: true, 
            amount: true, 
            paymentMethodId: true 
        }
    });

    // 4. Map to status
    const paymentMap = new Map(paidIncomes.map(p => [p.memberId, p]));

    return members.map(m => {
        const payment = paymentMap.get(m.id);
        return {
            member: m,
            hasPaid: !!payment,
            incomeId: payment?.id,
            amount: payment?.amount,
            paymentMethodId: payment?.paymentMethodId
        };
    });
}

export async function createIncome(data: {
    date: Date, 
    amount: number, 
    paymentMethodId: string, 
    description?: string, 
    categoryId: string, 
    memberId?: string
    extraMeta?: any
}) {
    const user = await checkTreasurerPermission();
    const fd = await getOrCreateTodayFinanceDay();

    const income = await prisma.income.create({
        data: {
            ...data,
            financeDayId: fd.id,
            createdById: user.id
        }
    });

    // Update FinanceDay balance? (Optional, can be computed on fly)
    
    revalidatePath("/dashboard/finance/income");
    revalidatePath("/dashboard/finance/overview");
    return income;
}

// --- EXPENSE ---
export async function getExpensesGrouped(date?: Date) {
    await checkTreasurerPermission();
    
    const where: any = {};
    if (date) {
        const start = new Date(date);
        start.setHours(0,0,0,0);
        const end = new Date(date);
        end.setHours(23,59,59,999);
        
        where.date = {
            gte: start,
            lte: end
        };
    }

    const expenses = await prisma.expense.findMany({
        where,
        orderBy: { date: 'desc' },
        include: { category: true, rab: true, paymentMethod: true }
    });

    const grouped: Record<string, typeof expenses> = {};
    expenses.forEach(exp => {
        const cat = exp.category.name;
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(exp);
    });

    return grouped;
}

export async function createExpense(data: {
    date: Date, 
    amount: number, 
    paymentMethodId: string, 
    description?: string, 
    categoryId: string, 
    rabId?: string
}) {
    const user = await checkTreasurerPermission();
    const fd = await getOrCreateTodayFinanceDay();

    // Validate RAB linking
    if (data.rabId) {
        // Optional: Check existence. Prisma will throw FK error anyway.
    }

    const expense = await prisma.$transaction(async (tx) => {
        const exp = await tx.expense.create({
            data: {
                ...data,
                financeDayId: fd.id,
                createdById: user.id
            }
        });

        if (data.rabId) {
            await tx.rab.update({
                where: { id: data.rabId },
                data: { status: 'REALIZED' }
            });
        }
        return exp;
    });

    revalidatePath("/dashboard/finance/expense");
    revalidatePath("/dashboard/finance/overview");
    return expense;
}

// --- RAB ---
export async function getRabs(date?: Date) {
    await checkTreasurerPermission();
    
    const where: any = {};
    if (date) {
        // Create date in UTC for @db.Date comparison
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();
        const utcDate = new Date(Date.UTC(year, month, day));
        
        where.date = utcDate;
    }

    return prisma.rab.findMany({
        where,
        include: { 
            items: true,
            rabCategory: true,
            expense: true
        },
        orderBy: { rabCategory: { name: 'asc' } }
    });
}

export async function createRab(data: { date: Date, rabCategoryId: string }) {
    await checkTreasurerPermission();
    
    // Convert local date to UTC date for @db.Date storage
    const year = data.date.getFullYear();
    const month = data.date.getMonth();
    const day = data.date.getDate();
    const utcDate = new Date(Date.UTC(year, month, day));

    const existing = await prisma.rab.findUnique({
        where: {
            date_rabCategoryId: {
                date: utcDate,
                rabCategoryId: data.rabCategoryId
            }
        }
    });

    if (existing) throw new Error("RAB for this category and date already exists.");

    const rab = await prisma.rab.create({
        data: {
            date: utcDate,
            rabCategoryId: data.rabCategoryId,
            status: "DRAFT",
            total: 0
        }
    });
    
    revalidatePath("/dashboard/finance/rab");
    return rab;
}

export async function deleteRab(id: string) {
    await checkTreasurerPermission();
    
    // Check status
    const rab = await prisma.rab.findUnique({ 
        where: { id },
        include: { expense: true }
    });

    if (!rab) throw new Error("Budget plan not found");

    if (rab.status === 'REALIZED' || rab.expense) {
         throw new Error("Cannot delete a realized/paid Budget Plan.");
    }

    await prisma.rab.delete({ where: { id } });
    revalidatePath("/dashboard/finance/rab");
}

// Helper to get grouped RAB items (e.g., for Expense selection)
export async function getRabItemsGrouped() {
    await checkTreasurerPermission();
    const items = await prisma.rabItem.findMany({
        include: { rab: { include: { rabCategory: true } } },
        orderBy: { name: 'asc' }
    });
    
    // Group by Utility? or Just return flat and let UI filter
    return items;
}


export async function createRabItem(data: {
    rabId: string, 
    // rabCategoryId: string, // Removed
    name: string, 
    quantity: number, 
    unit: string,
    unitPrice: number
}) {
    await checkTreasurerPermission();
    const total = data.quantity * data.unitPrice;
    
    const [item] = await prisma.$transaction([
        prisma.rabItem.create({
            data: {
                rabId: data.rabId,
                name: data.name,
                quantity: data.quantity,
                unit: data.unit,
                unitPrice: data.unitPrice,
                total
            }
        }),
        prisma.rab.update({
            where: { id: data.rabId },
            data: { total: { increment: total } }
        })
    ]);
    
    revalidatePath("/dashboard/finance/rab");
    return item;
}

// --- OVERVIEW STATS ---
export async function getFinanceOverview() {
    await checkTreasurerPermission();
    
    // Simple aggregation
    const totalIncome = await prisma.income.aggregate({ _sum: { amount: true } });
    const totalExpense = await prisma.expense.aggregate({ _sum: { amount: true } });
    
    return {
        totalIncome: totalIncome._sum.amount || 0,
        totalExpense: totalExpense._sum.amount || 0,
        balance: (totalIncome._sum.amount || 0) - (totalExpense._sum.amount || 0)
    };
}

export async function getMonthlyStats() {
    await checkTreasurerPermission();

    const year = new Date().getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    const stats = await Promise.all(months.map(async (month) => {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0);

        const income = await prisma.income.aggregate({
            where: { date: { gte: start, lte: end } },
            _sum: { amount: true }
        });

        const expense = await prisma.expense.aggregate({
            where: { date: { gte: start, lte: end } },
            _sum: { amount: true }
        });

        return {
            name: start.toLocaleString('default', { month: 'short' }),
            income: income._sum.amount || 0,
            expense: expense._sum.amount || 0
        };
    }));


    return stats;
}

// --- DELETE & UPDATE LOGIC ---

// INCOME
export async function deleteIncome(id: string) {
    await checkTreasurerPermission();
    await prisma.income.delete({ where: { id } });
    revalidatePath("/dashboard/finance/income");
    revalidatePath("/dashboard/finance/overview");
}

export async function updateIncome(id: string, data: {
    date?: Date, 
    amount?: number, 
    paymentMethodId?: string, 
    description?: string, 
    categoryId?: string, 
    memberId?: string
    extraMeta?: any
}) {
    await checkTreasurerPermission();
    // Logic to recalculate finance days? For now simple update.
    await prisma.income.update({
        where: { id },
        data
    });
    revalidatePath("/dashboard/finance/income");
    revalidatePath("/dashboard/finance/overview");
}

// EXPENSE
export async function deleteExpense(id: string) {
    await checkTreasurerPermission();
    
    // Check if expense has linked RAB
    const expense = await prisma.expense.findUnique({
        where: { id },
        include: { rab: true }
    });
    
    // Transaction delete
    await prisma.$transaction(async (tx) => {
        if (expense?.rabId) {
             await tx.rab.update({
                 where: { id: expense.rabId },
                 data: { status: 'DRAFT' } // Revert to planned/draft
             });
        }
        
        await tx.expense.delete({ where: { id } });
    });

    revalidatePath("/dashboard/finance/expense");
    revalidatePath("/dashboard/finance/overview");
    // Also revalidate RAB page because status changed
    revalidatePath("/dashboard/finance/rab");
}

export async function updateExpense(id: string, data: {
    date?: Date, 
    amount?: number, 
    paymentMethodId?: string, 
    description?: string, 
    categoryId?: string
}) {
    await checkTreasurerPermission();
    await prisma.expense.update({
        where: { id },
        data
    });
    revalidatePath("/dashboard/finance/expense");
    revalidatePath("/dashboard/finance/overview");
}


// RAB ITEMS
export async function deleteRabItem(id: string) {
    await checkTreasurerPermission();
    
    // Check item and Rab status
    const item = await prisma.rabItem.findUnique({ where: { id } });
    if (!item) throw new Error("Item not found");

    const rab = await prisma.rab.findUnique({ 
        where: { id: item.rabId },
        include: { expense: true }
    });

    if (rab?.status === 'REALIZED' || rab?.expense) {
         throw new Error("Cannot delete item from a Realized (Paid) RAB.");
    }

    await prisma.$transaction([
        prisma.rabItem.delete({ where: { id } }),
        prisma.rab.update({ 
            where: { id: item.rabId },
            data: { total: { decrement: item.total } }
        })
    ]);

    revalidatePath("/dashboard/finance/rab");
}

export async function updateRabItem(id: string, data: {
    name?: string, 
    quantity?: number, 
    unit?: string,
    unitPrice?: number
}) {
    await checkTreasurerPermission();
    
    const item = await prisma.rabItem.findUnique({ where: { id } });
    if (!item) throw new Error("RAB Item not found");
    
    // Check locked status
    const rab = await prisma.rab.findUnique({ where: { id: item.rabId }, include: { expense: true } });
    if (rab?.status === 'REALIZED' || rab?.expense) {
         throw new Error("Cannot modify item of a Realized (Paid) RAB.");
    }

    let updateData: any = { ...data };
    let totalDiff = 0;

    if (data.quantity !== undefined || data.unitPrice !== undefined) {
         const qty = data.quantity ?? item.quantity;
         const price = data.unitPrice ?? item.unitPrice;
         const newTotal = qty * price;
         totalDiff = newTotal - item.total;
         updateData.total = newTotal;
    }

    await prisma.$transaction([
        prisma.rabItem.update({
             where: { id },
             data: updateData
        }),
        prisma.rab.update({
            where: { id: item.rabId },
            data: { total: { increment: totalDiff } }
        })
    ]);
    
    revalidatePath("/dashboard/finance/rab");
}
