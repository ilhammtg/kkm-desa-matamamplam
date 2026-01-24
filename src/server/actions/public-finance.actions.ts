"use server";

import { prisma } from "@/server/db/prisma";

export async function getPublicFinanceSummary() {
    // Aggregation similar to finance actions but no auth check needed as it's public data
    const totalIncome = await prisma.income.aggregate({ _sum: { amount: true } });
    const totalExpense = await prisma.expense.aggregate({ _sum: { amount: true } });
    
    return {
        totalIncome: totalIncome._sum.amount || 0,
        totalExpense: totalExpense._sum.amount || 0,
        balance: (totalIncome._sum.amount || 0) - (totalExpense._sum.amount || 0)
    };
}

export async function getPublicMonthlyStats() {
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

export async function getPublicTransactions() {
    // Fetch last 50 transactions combining Income and Expense
    // We must return a unified structure
    // We must HIDE sensitive data (names of members for Kas)

    const [incomes, expenses] = await Promise.all([
        prisma.income.findMany({
            orderBy: { date: 'desc' },
            include: { category: true, member: true }
        }),
        prisma.expense.findMany({
            orderBy: { date: 'desc' },
            include: { category: true }
        })
    ]);

    // Map to unified type
    const mappedIncomes = incomes.map(inv => {
        let description = inv.description || "";
        
        // Anonymize/Sanitize logic
        if (inv.category.name === "Kas Anggota") {
             // If description contains specific name, replace it? 
             // Ideally description for Kas is "Kas Harian" or "Kas Bulan X"
             // But if it was auto-generated or manual note like "Kas Ilham", we should mask it.
             // Simpler approach: Just force description to be "Kas Anggota" if it is Kas Anggota.
             description = "Pemasukan Kas Anggota";
        }

        return {
            id: inv.id,
            date: inv.date,
            type: "INCOME",
            category: inv.category.name,
            description: description,
            amount: inv.amount
        };
    });

    const mappedExpenses = expenses.map(exp => ({
        id: exp.id,
        date: exp.date,
        type: "EXPENSE",
        category: exp.category.name,
        description: exp.description || "Pengeluaran Operasional",
        amount: exp.amount
    }));

    // Combine and sort
    // Return separate lists max 50 each
    return {
        incomes: mappedIncomes,
        expenses: mappedExpenses
    };
}
