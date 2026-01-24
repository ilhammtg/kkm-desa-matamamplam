
"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Loader2, CheckCircle2, Circle, Save, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getKasMembersStatus, createIncome, deleteIncome } from "@/server/actions/finance.actions";
import { toast } from "sonner";
import { formatCurrency, cn } from "@/lib/utils";

interface BatchKasEntryProps {
    date: Date;
    paymentMethods: any[];
    categories: any[];
    onClose: () => void;
}

export function BatchKasEntry({ date, paymentMethods, categories, onClose }: BatchKasEntryProps) {
    const [loading, setLoading] = useState(true);
    const [membersStatus, setMembersStatus] = useState<any[]>([]);
    
    // Global Settings
    const [globalAmount, setGlobalAmount] = useState<number>(5000);
    const [globalNote, setGlobalNote] = useState("Kas Hari Ke");
    // const [globalMethod, setGlobalMethod] = useState(""); // If we want to force method

    // Loading states for individual rows
    const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

    const kasCategoryId = categories.find(c => c.name === "Kas Anggota")?.id;

    const fetchStatus = async () => {
        setLoading(true);
        try {
            const data = await getKasMembersStatus(date);
            setMembersStatus(data);
        } catch (e) {
            toast.error("Failed to load member status");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, [date]);

    const handleTogglePay = async (item: any, currentMethodId: string) => {
        if (!kasCategoryId) return toast.error("Kategori 'Kas Anggota' tidak ditemukan");
        
        const memberId = item.member.id;
        setProcessingIds(prev => new Set(prev).add(memberId));
        
        try {
            if (item.hasPaid) {
                // Delete / Undo
                if (item.incomeId) {
                    await deleteIncome(item.incomeId);
                    toast.success(`Pembayaran ${item.member.name} dibatalkan`);
                }
            } else {
                // Pay
                await createIncome({
                    date: date,
                    amount: globalAmount,
                    paymentMethodId: currentMethodId, // Use per-row method if we tracked it, or global
                    categoryId: kasCategoryId,
                    memberId: memberId,
                    description: globalNote
                });
                toast.success(`Pembayaran ${item.member.name} berhasil`);
            }
            // Refresh single item or all? Refreshing all is safer for consistency but slower.
            // Let's just re-fetch for now to be safe.
            await fetchStatus(); 
        } catch (e: any) {
            toast.error(e.message || "Action failed");
        } finally {
            setProcessingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(memberId);
                return newSet;
            });
        }
    };

    return (
        <Card className="border-2 border-primary/20">
            <CardHeader className="bg-muted/30 pb-4">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <RefreshCw className="h-5 w-5 text-primary" />
                            Mode Catat Kas Massal
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Tanggal: <span className="font-semibold text-foreground">{format(date, "dd MMMM yyyy")}</span>
                        </p>
                    </div>
                    <Button variant="ghost" onClick={onClose}>Tutup Mode Massal</Button>
                </div>
                
                {/* Global Controls */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-background border rounded-lg shadow-sm">
                    <div className="space-y-2">
                        <Label>Nominal Seragam (Rp)</Label>
                        <Input 
                            type="number" 
                            value={globalAmount} 
                            onChange={(e) => setGlobalAmount(parseInt(e.target.value) || 0)}
                        />
                         <p className="text-[10px] text-muted-foreground">Nominal ini akan dipakai saat tombol "Bayar" diklik.</p>
                    </div>
                    <div className="space-y-2">
                        <Label>Catatan / Keterangan</Label>
                        <Input 
                            value={globalNote} 
                            onChange={(e) => setGlobalNote(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2 flex items-end">
                       <div className="text-xs text-muted-foreground w-full">
                           Pastikan nominal dan catatan sudah benar sebelum menekan tombol Bayar pada list di bawah.
                       </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {loading ? (
                    <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>
                ) : (
                    <div className="divide-y max-h-[600px] overflow-y-auto">
                        <div className="grid grid-cols-12 gap-2 p-3 bg-muted/50 font-medium text-xs uppercase tracking-wider text-muted-foreground sticky top-0 backdrop-blur-sm">
                           <div className="col-span-4">Anggota</div>
                           <div className="col-span-3">Metode Bayar</div>
                           <div className="col-span-3 text-right">Status</div>
                           <div className="col-span-2 text-right">Aksi</div> 
                        </div>
                        {membersStatus.map((item) => (
                           <BatchRow 
                                key={item.member.id} 
                                item={item} 
                                paymentMethods={paymentMethods}
                                onToggle={(methodId: string) => handleTogglePay(item, methodId)}
                                isProcessing={processingIds.has(item.member.id)}
                           />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function BatchRow({ item, paymentMethods, onToggle, isProcessing }: any) {
    // Local state for payment method selection (defaults to first active method or CASH)
    const defaultMethod = paymentMethods.find((p: any) => p.name.toLowerCase().includes("cash"))?.id || paymentMethods[0]?.id;
    const [methodId, setMethodId] = useState(item.paymentMethodId || defaultMethod);

    return (
        <div className={cn(
            "grid grid-cols-12 gap-2 p-3 items-center hover:bg-muted/20 transition-colors",
            item.hasPaid ? "bg-emerald-50/50 dark:bg-emerald-950/10" : ""
        )}>
            <div className="col-span-4">
                <div className="font-medium text-sm">{item.member.name}</div>
                <div className="text-xs text-muted-foreground">{item.member.npm}</div>
            </div>
            <div className="col-span-3">
                {item.hasPaid ? (
                     <span className="text-xs font-medium px-2 py-1 bg-secondary rounded-full">
                         {paymentMethods.find((p: any) => p.id === item.paymentMethodId)?.name || "Unknown"}
                     </span>
                ) : (
                    <Select value={methodId} onValueChange={setMethodId}>
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {paymentMethods.map((pm: any) => (
                                <SelectItem key={pm.id} value={pm.id}>{pm.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>
            <div className="col-span-3 text-right">
                {item.hasPaid ? (
                     <div className="flex flex-col items-end">
                         <span className="flex items-center gap-1 text-emerald-600 font-bold text-sm">
                             <CheckCircle2 className="h-4 w-4" /> Lunas
                         </span>
                         <span className="text-xs text-muted-foreground">{formatCurrency(item.amount)}</span>
                     </div>
                ) : (
                    <span className="flex items-center gap-1 text-muted-foreground justify-end text-sm">
                        <Circle className="h-4 w-4" /> Belum
                    </span>
                )}
            </div>
            <div className="col-span-2 flex justify-end">
                <Button 
                    size="sm" 
                    variant={item.hasPaid ? "ghost" : "default"}
                    className={cn(
                        "h-8 text-xs", 
                        item.hasPaid && "text-destructive hover:bg-destructive/10 hover:text-destructive"
                    )}
                    disabled={isProcessing}
                    onClick={() => onToggle(methodId)}
                >
                    {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : (
                        item.hasPaid ? "Batal" : "Bayar"
                    )}
                </Button>
            </div>
        </div>
    );
}
