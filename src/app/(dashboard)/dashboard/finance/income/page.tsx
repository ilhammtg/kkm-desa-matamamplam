"use client";

import { useEffect, useState } from "react";
import { 
    getIncomesGrouped, 
    getIncomeCategories, 
    getMembersForFinance, 
    getPaymentMethods,
    createIncome,
    deleteIncome,
    updateIncome,
    getUnpaidMembers
} from "@/server/actions/finance.actions";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { formatCurrency, cn } from "@/lib/utils";
import { toast } from "sonner";
import { CalendarIcon, Plus, Loader2, Trash2, Pencil, AlertCircle, ListChecks } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { BatchKasEntry } from "@/components/finance/BatchKasEntry";

export default function FinanceIncomePage() {
  const [loading, setLoading] = useState(true);
  const [groupedData, setGroupedData] = useState<Record<string, any[]>>({});
  const [categories, setCategories] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  
  // Date Filter & Unpaid Warning
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [unpaidMembers, setUnpaidMembers] = useState<any[]>([]);

  // Form States
  const [displayAmount, setDisplayAmount] = useState("");

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Batch Mode State
  const [isBatchMode, setIsBatchMode] = useState(false);

  
  const [formData, setFormData] = useState({
      date: new Date(),
      amount: "" as any, // Type assertion to allow string for placeholder
      paymentMethodId: "",
      categoryId: "",
      memberId: "",
      description: "",
      extraMeta: {} as any
  });


  const fetchData = async () => {
      setLoading(true);
      try {
          const [grouped, cats, mems, pms, unpaid] = await Promise.all([
              getIncomesGrouped(selectedDate),
              getIncomeCategories(),
              getMembersForFinance(),
              getPaymentMethods(),
              selectedDate ? getUnpaidMembers(selectedDate) : Promise.resolve([])
          ]);
          setGroupedData(grouped);
          setCategories(cats);
          setMembers(mems);
          setPaymentMethods(pms);
          setUnpaidMembers(unpaid);
      } catch (error) {
          toast.error("Failed to load data");
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      fetchData();
  }, [selectedDate]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove non-digits
    const numericString = value.replace(/\D/g, "");
    
    if (numericString === "") {
        setDisplayAmount("");
        setFormData(prev => ({ ...prev, amount: "" }));
        return;
    }

    const numberValue = parseInt(numericString);
    // Format display
    setDisplayAmount(formatCurrency(numberValue));
    setFormData(prev => ({ ...prev, amount: numberValue }));
  };

  const handleCreate = async () => {
      if (!formData.amount || !formData.categoryId || !formData.paymentMethodId) {
          return toast.error("Please fill required fields (Amount, Category, Payment Method)");
      }

      setSubmitting(true);
      try {
          if (editingId) {
             await updateIncome(editingId, {
                date: formData.date,
                amount: typeof formData.amount === 'string' ? parseInt(formData.amount) : formData.amount,
                paymentMethodId: formData.paymentMethodId,
                categoryId: formData.categoryId,
                memberId: formData.memberId || undefined,
                description: formData.description,
                extraMeta: formData.extraMeta
             });
             toast.success("Income updated!");
          } else {
             await createIncome({
                date: formData.date,
                amount: typeof formData.amount === 'string' ? parseInt(formData.amount) : formData.amount,
                paymentMethodId: formData.paymentMethodId,
                categoryId: formData.categoryId,
                memberId: formData.memberId || undefined,
                description: formData.description,
                extraMeta: formData.extraMeta
             });
             toast.success("Income saved!");
          }
          
          setDialogOpen(false);
          setEditingId(null);
          // Reset form
          setFormData(prev => ({ ...prev, amount: "", description: "" })); 
          setDisplayAmount("");
          fetchData();
      } catch (error: any) {
          toast.error(error.message);
      } finally {
          setSubmitting(false);
      }
  };

  const handleEdit = (item: any) => {
      setEditingId(item.id);
      setFormData({
          date: new Date(item.date),
          amount: item.amount,
          paymentMethodId: item.paymentMethodId,
          categoryId: item.categoryId,
          memberId: item.memberId || "",
          description: item.description || "",
          extraMeta: item.extraMeta || {}
      });
      setDisplayAmount(formatCurrency(item.amount));
      setDialogOpen(true);
  };
    
  // On open dialog reset if not editing
  const onDialogOpenChange = (open: boolean) => {
      if (open && !editingId) {
          // Reset if opening in "Create" mode
          setFormData(prev => ({ ...prev, date: new Date(), amount: "", description: "" }));
          setDisplayAmount("");
      }
      setDialogOpen(open);
  }


  const confirmDelete = (id: string) => {
      setDeletingId(id);
      setDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
      if(!deletingId) return;
      try {
          await deleteIncome(deletingId);
          toast.success("Record deleted");
          fetchData();
      } catch (e: any) {
          toast.error(e.message || "Failed to delete");
      } finally {
          setDeleteDialogOpen(false);
          setDeletingId(null);
      }
  };

  // Helper to determine fields based on selected category
  const selectedCategoryName = categories.find(c => c.id === formData.categoryId)?.name || "";
  const showMemberSelect = ["Kas Anggota", "Denda"].includes(selectedCategoryName);
  const isDenda = selectedCategoryName === "Denda";
  const isHibah = selectedCategoryName === "Hibah Kampus";

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Pemasukan (Income)</h2>
                <p className="text-muted-foreground">Manage and track all incoming funds by category.</p>
            </div>
            {/* Date Filter */}
            <div className="flex items-center gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant={"outline"} className={cn("w-[240px] pl-3 text-left font-normal", !selectedDate && "text-muted-foreground")}>
                            {selectedDate ? format(selectedDate, "PPP") : <span>Filter by Date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={selectedDate} onSelect={(d) => d && setSelectedDate(d)} initialFocus />
                    </PopoverContent>
                </Popover>
                {selectedDate ? (
                    <Button variant="secondary" onClick={() => setSelectedDate(undefined)}>
                        View All Data
                    </Button>
                ) : (
                    <Button variant="default" onClick={() => setSelectedDate(new Date())}>
                        Filter Today
                    </Button>
                )}
            </div>
        </div>
            
            {!isBatchMode && (
                <Button variant="outline" onClick={() => setIsBatchMode(true)} className="ml-auto mr-2">
                    <ListChecks className="mr-2 h-4 w-4" /> Mode Catat Kas Massal
                </Button>
            )}

            <Dialog open={dialogOpen} onOpenChange={onDialogOpenChange}>
            <DialogTrigger asChild>
                <Button onClick={() => {
                   setEditingId(null); // Ensure null on explicit click
                }}>
                    <Plus className="mr-2 h-4 w-4" /> Record Income
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>{editingId ? "Edit Income Record" : "Record Income Record"}</DialogTitle>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                    {/* Top Row: Date & Category */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 flex flex-col">
                            <Label>Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !formData.date && "text-muted-foreground")}>
                                        {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={formData.date} onSelect={(d) => d && setFormData({...formData, date: d})} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                             <Label>Category</Label>
                             <Select value={formData.categoryId} onValueChange={(v) => setFormData(prev => ({ ...prev, categoryId: v, memberId: "" }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                </SelectContent>
                             </Select>
                        </div>
                    </div>

                    {/* Dynamic Fields */}
                    {formData.categoryId && (
                        <div className="space-y-4 border rounded-md p-4 bg-muted/20 animate-in fade-in-50">
                            {showMemberSelect && (
                                <div className="space-y-2">
                                    <Label>Member Source</Label>
                                    <SearchableSelect
                                        items={members.map(m => ({ value: m.id, label: `${m.name} (${m.npm})` }))}
                                        value={formData.memberId}
                                        onValueChange={(v) => setFormData({...formData, memberId: v})}
                                        placeholder="Search member..."
                                        emptyText="Member not found."
                                    />
                                </div>
                            )}

                            {isHibah && (
                                <div className="space-y-2">
                                    <Label>Tahap / Keterangan</Label>
                                    <Input 
                                        placeholder="Contoh: Tahap 1" 
                                        value={formData.extraMeta?.tahap || ""}
                                        onChange={(e) => setFormData({...formData, extraMeta: { ...formData.extraMeta, tahap: e.target.value }})}
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Payment Method</Label>
                                    <Select value={formData.paymentMethodId} onValueChange={(v) => setFormData({...formData, paymentMethodId: v})}>
                                        <SelectTrigger><SelectValue placeholder="Method" /></SelectTrigger>
                                        <SelectContent>
                                            {paymentMethods.map(pm => (
                                                <SelectItem key={pm.id} value={pm.id}>{pm.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Amount (Rp)</Label>
                                    <Input 
                                        type="text"
                                        value={displayAmount}
                                        placeholder="Rp 0"
                                        onChange={handleAmountChange}
                                    />
                                    <p className="text-xs text-muted-foreground">Masukkan nominal penuh (misal: 10000 untuk 10rb)</p>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Notes / Description</Label>
                                <Input 
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder={isDenda ? "Alasan denda..." : "Optional notes..."}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button onClick={handleCreate} disabled={submitting}>
                        {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Save Record
                    </Button>
                </DialogFooter>
            </DialogContent>

        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this specific income record? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={executeDelete}>
                        Delete Record
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>

      {unpaidMembers.length > 0 && (
        <Card className="border-l-4 border-l-amber-500 bg-amber-500/10 mb-8">
            <CardHeader className="py-4">
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
                    <AlertCircle className="h-5 w-5" />
                    <CardTitle className="text-lg">Belum Bayar Kas ( {format(selectedDate!, 'dd MMMM yyyy')} )</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    {unpaidMembers.map((m) => (
                        <div key={m.id} className="flex items-center gap-2 bg-background/80 px-3 py-1.5 rounded-full border shadow-sm text-sm">
                            <span className="font-semibold">{m.name}</span>
                            <span className="text-muted-foreground text-xs">({m.npm})</span>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4">* Menampilkan anggota yang belum ada catatan "Kas Anggota" pada tanggal ini.</p>
            </CardContent>
        </Card>
      )}

      {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : isBatchMode ? (
          <BatchKasEntry 
             date={selectedDate || new Date()} 
             paymentMethods={paymentMethods} 
             categories={categories}
             onClose={() => {
                 setIsBatchMode(false);
                 fetchData(); // Refresh data when closing
             }} 
          />
      ) : (
          <div className="space-y-8">
              {categories.map((category) => {
                  const categoryData = groupedData[category.name] || [];
                  const categoryTotal = categoryData.reduce((acc: number, cur: any) => acc + cur.amount, 0);

                  return (
                      <Card key={category.id} className="overflow-hidden">
                          <CardHeader className="bg-muted/40 py-4">
                              <div className="flex justify-between items-center">
                                  <CardTitle className="text-lg font-bold uppercase tracking-wider text-primary">{category.name}</CardTitle>
                                  <div className="text-sm font-medium text-muted-foreground">
                                      Total: <span className="text-foreground font-bold">{formatCurrency(categoryTotal)}</span>
                                  </div>
                              </div>
                          </CardHeader>
                          <CardContent className="p-0">
                               <Table>
                                   <TableHeader>
                                       <TableRow>
                                           <TableHead className="w-[150px]">Date</TableHead>
                                           {["Kas Anggota", "Denda"].includes(category.name) && <TableHead>Member</TableHead>}
                                           <TableHead>Description/Notes</TableHead>
                                           <TableHead>Method</TableHead>
                                           <TableHead className="text-right">Amount</TableHead>
                                           <TableHead className="w-[100px]"></TableHead>
                                       </TableRow>
                                   </TableHeader>
                                   <TableBody>
                                       {categoryData.length === 0 ? (
                                           <TableRow>
                                               <TableCell colSpan={5} className="text-center text-muted-foreground h-20">No data for {category.name}</TableCell>
                                           </TableRow>
                                       ) : (
                                           categoryData.map((item: any) => (
                                               <TableRow key={item.id}>
                                                   <TableCell>{format(new Date(item.date), "dd/MM/yyyy")}</TableCell>
                                                   {["Kas Anggota", "Denda"].includes(category.name) && (
                                                       <TableCell>
                                                           {item.member ? (
                                                               <span className="font-medium">{item.member.name}</span>
                                                           ) : "-"}
                                                       </TableCell>
                                                   )}
                                                   <TableCell>
                                                       {item.description || "-"}
                                                       {item.extraMeta?.tahap && <span className="ml-2 text-xs bg-secondary px-1.5 py-0.5 rounded">Tahap {item.extraMeta.tahap}</span>}
                                                   </TableCell>
                                                   <TableCell>
                                                       <span className="px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                                                            {item.paymentMethod?.name || "Unknown"}
                                                       </span>
                                                   </TableCell>
                                                   <TableCell className="text-right font-bold text-emerald-600">
                                                       +{formatCurrency(item.amount)}
                                                   </TableCell>
                                                   <TableCell>
                                                       <div className="flex items-center justify-end gap-2">
                                                           <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleEdit(item)}>
                                                               <Pencil className="h-4 w-4" />
                                                           </Button>
                                                           <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => confirmDelete(item.id)}>
                                                               <Trash2 className="h-4 w-4" />
                                                           </Button>
                                                       </div>
                                                   </TableCell>
                                               </TableRow>
                                           ))
                                       )}
                                       {/* Subtotal Row */}
                                       {categoryData.length > 0 && (
                                           <TableRow className="bg-muted/50 font-bold">
                                               <TableCell colSpan={["Kas Anggota", "Denda"].includes(category.name) ? 4 : 3} className="text-right">Subtotal {category.name}</TableCell>
                                               <TableCell className="text-right">{formatCurrency(categoryTotal)}</TableCell>
                                           </TableRow>
                                       )}
                                   </TableBody>
                               </Table>
                          </CardContent>
                      </Card>
                  );
              })}
          </div>
      )}
    </div>
  );
}
