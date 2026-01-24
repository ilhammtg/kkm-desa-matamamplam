
"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { ArrowDownCircle, ArrowUpCircle, Wallet, Calendar, FileText } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, cn } from "@/lib/utils";
import { getPublicFinanceSummary, getPublicMonthlyStats, getPublicTransactions } from "@/server/actions/public-finance.actions";

export default function TransparencyPage() {
    const [summary, setSummary] = useState<any>(null);
    const [monthlyStats, setMonthlyStats] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<{ incomes: any[], expenses: any[] }>({ incomes: [], expenses: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const [sum, stats, txs] = await Promise.all([
                    getPublicFinanceSummary(),
                    getPublicMonthlyStats(),
                    getPublicTransactions()
                ]);
                setSummary(sum);
                setMonthlyStats(stats);
                setTransactions(txs);
            } catch (e) {
                console.error("Failed to load public finance data", e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const incomeTotal = transactions.incomes.reduce((acc, curr) => acc + curr.amount, 0);
    const expenseTotal = transactions.expenses.reduce((acc, curr) => acc + curr.amount, 0);

    if (loading) {
        return (
            <div className="container py-20 min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <div className="h-12 w-12 rounded-full bg-muted"></div>
                    <div className="h-4 w-48 bg-muted rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950/50">
            {/* Header Section */}
            <div className="bg-white dark:bg-slate-950 border-b py-12">
                <div className="container mx-auto px-6 max-w-7xl text-center">
                    <div className="mx-auto max-w-2xl">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl mb-4">
                            Transparansi Keuangan
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400">
                            Laporan keuangan terbuka KKM Mata Mamplam. Kami menjunjung tinggi akuntabilitas dan transparansi dalam pengelolaan dana kegiatan.
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 max-w-7xl py-10 space-y-10">
                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
                            <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(summary?.totalIncome || 0)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Akumulasi dana masuk
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-rose-500 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
                            <ArrowDownCircle className="h-4 w-4 text-rose-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                                {formatCurrency(summary?.totalExpense || 0)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Penggunaan dana operasional
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Sisa Saldo</CardTitle>
                            <Wallet className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {formatCurrency(summary?.balance || 0)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Dana tersedia saat ini
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Section */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-center md:text-left">Arus Kas Bulanan</CardTitle>
                        <CardDescription className="text-center md:text-left">
                            Grafik perbandingan pemasukan dan pengeluaran per bulan tahun ini.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-0">
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyStats} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <XAxis 
                                        dataKey="name" 
                                        stroke="#888888" 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false} 
                                    />
                                    <YAxis 
                                        stroke="#888888" 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false}
                                        tickFormatter={(value) => `Rp${(value / 1000).toFixed(0)}k`} 
                                    />
                                    <Tooltip 
                                        formatter={(value: number | undefined) => formatCurrency(value || 0)}
                                        contentStyle={{ borderRadius: "8px" }}
                                    />
                                    <Legend />
                                    <Bar dataKey="income" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="expense" name="Pengeluaran" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Separate Tables Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     {/* Income Table */}
                     <Card className="shadow-sm border-t-4 border-t-emerald-500">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Riwayat Pemasukan</CardTitle>
                                    <CardDescription>Semua Transaksi masuk</CardDescription>
                                </div>
                                <ArrowUpCircle className="h-5 w-5 text-emerald-500" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="max-h-[500px] overflow-y-auto">
                                <Table>
                                    <TableHeader className="bg-background sticky top-0 z-10 shadow-sm">
                                        <TableRow>
                                            <TableHead>Tanggal</TableHead>
                                            <TableHead>Ket.</TableHead>
                                            <TableHead className="text-right">Jumlah</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                <TableBody>
                                    {transactions.incomes.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="h-24 text-center">Data masih kosong.</TableCell>
                                        </TableRow>
                                    ) : (
                                        transactions.incomes.map((t) => (
                                            <TableRow key={t.id}>
                                                <TableCell className="font-medium text-xs text-muted-foreground whitespace-nowrap">
                                                    {format(new Date(t.date), "dd/MM/yy")}
                                                </TableCell>
                                                <TableCell className="max-w-[150px] truncate text-xs" title={t.description}>
                                                    <div className="font-medium">{t.category}</div>
                                                    <div className="text-muted-foreground">{t.description}</div>
                                                </TableCell>
                                                <TableCell className="text-right font-semibold text-emerald-600 text-sm">
                                                    {formatCurrency(t.amount)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                            </div>
                            <div className="p-4 bg-muted/50 border-t flex justify-between items-center rounded-b-lg">
                                <span className="font-bold text-sm">Total Pemasukan</span>
                                <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(incomeTotal)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Expense Table */}
                    <Card className="shadow-sm border-t-4 border-t-rose-500">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Riwayat Pengeluaran</CardTitle>
                                    <CardDescription>Semua Transaksi keluar</CardDescription>
                                </div>
                                <ArrowDownCircle className="h-5 w-5 text-rose-500" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="max-h-[500px] overflow-y-auto">
                                <Table>
                                    <TableHeader className="bg-background sticky top-0 z-10 shadow-sm">
                                        <TableRow>
                                            <TableHead>Tanggal</TableHead>
                                            <TableHead>Ket.</TableHead>
                                            <TableHead className="text-right">Jumlah</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                <TableBody>
                                    {transactions.expenses.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="h-24 text-center">Data masih kosong.</TableCell>
                                        </TableRow>
                                    ) : (
                                        transactions.expenses.map((t) => (
                                            <TableRow key={t.id}>
                                                <TableCell className="font-medium text-xs text-muted-foreground whitespace-nowrap">
                                                    {format(new Date(t.date), "dd/MM/yy")}
                                                </TableCell>
                                                <TableCell className="max-w-[150px] truncate text-xs" title={t.description}>
                                                    <div className="font-medium">{t.category}</div>
                                                    <div className="text-muted-foreground">{t.description}</div>
                                                </TableCell>
                                                <TableCell className="text-right font-semibold text-rose-600 text-sm">
                                                    {formatCurrency(t.amount)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                            </div>
                            <div className="p-4 bg-muted/50 border-t flex justify-between items-center rounded-b-lg">
                                <span className="font-bold text-sm">Total Pengeluaran</span>
                                <span className="font-bold text-rose-700 dark:text-rose-400">{formatCurrency(expenseTotal)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
