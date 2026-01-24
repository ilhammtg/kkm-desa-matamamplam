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
// --- INCOME ---
export async function getIncomesGrouped(date?: Date) {
    await checkTreasurerPermission();
    
    // Build where clause
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
        include: { category: true, rabItem: true, paymentMethod: true }
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
    rabItemId?: string
}) {
    const user = await checkTreasurerPermission();
    const fd = await getOrCreateTodayFinanceDay();

    const expense = await prisma.expense.create({
        data: {
            ...data,
            financeDayId: fd.id,
            createdById: user.id
        }
    });

    revalidatePath("/dashboard/finance/expense");
    revalidatePath("/dashboard/finance/overview");
    return expense;
}

// --- RAB ---
export async function getRabs() {
    await checkTreasurerPermission();
    return prisma.rab.findMany({
        include: { 
            items: {
                include: { rabCategory: true }
            } 
        },
        orderBy: { year: 'desc' }
    });
}

// Helper to get grouped RAB items (e.g., for Expense selection)
export async function getRabItemsGrouped() {
    await checkTreasurerPermission();
    const items = await prisma.rabItem.findMany({
        include: { rab: true, rabCategory: true },
        orderBy: { name: 'asc' }
    });
    
    // Group by Utility? or Just return flat and let UI filter
    return items;
}

export async function createRabItem(data: {
    rabId: string, 
    rabCategoryId: string,
    name: string, 
    quantity: number, 
    unit: string,
    unitPrice: number
}) {
    await checkTreasurerPermission();
    const total = data.quantity * data.unitPrice;
    const item = await prisma.rabItem.create({
        data: {
            ...data,
            total
        }
    });
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
    await prisma.expense.delete({ where: { id } });
    revalidatePath("/dashboard/finance/expense");
    revalidatePath("/dashboard/finance/overview");
}

export async function updateExpense(id: string, data: {
    date?: Date, 
    amount?: number, 
    paymentMethodId?: string, 
    description?: string, 
    categoryId?: string, 
    rabItemId?: string
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
    
    // Check if used in Expense
    const usageCount = await prisma.expense.count({ where: { rabItemId: id } });
    if (usageCount > 0) {
        throw new Error(`Cannot delete: Item is used in ${usageCount} expense records.`);
    }

    await prisma.rabItem.delete({ where: { id } });
    revalidatePath("/dashboard/finance/rab");
}

export async function updateRabItem(id: string, data: {
    name?: string, 
    quantity?: number, 
    unit?: string,
    unitPrice?: number,
    rabCategoryId?: string
}) {
    await checkTreasurerPermission();
    
    // Recalculate total if qty/price changes
    let updateData: any = { ...data };
    
    if (data.quantity !== undefined || data.unitPrice !== undefined) {
         // We need current values if only one is updated, but simpler to expect both or fetch. 
         // For efficiency let's assume UI sends both or we fetch.
         // Let's fetch to be safe.
         const current = await prisma.rabItem.findUnique({ where: { id } });
         if (!current) throw new Error("RAB Item not found");
         
         const qty = data.quantity ?? current.quantity;
         const price = data.unitPrice ?? current.unitPrice;
         updateData.total = qty * price;
    }

    await prisma.rabItem.update({
        where: { id },
        data: updateData
    });
    revalidatePath("/dashboard/finance/rab");
}
