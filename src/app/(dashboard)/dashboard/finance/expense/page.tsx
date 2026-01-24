"use client";

import { useEffect, useState } from "react";
import { 
    getExpensesGrouped, 
    getExpenseCategories, 
    getPaymentMethods,
    getRabItemsGrouped,
    createExpense,
    deleteExpense,
    updateExpense
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
import { CalendarIcon, Plus, Loader2, Pencil, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export default function FinanceExpensePage() {
  const [loading, setLoading] = useState(true);
  const [groupedData, setGroupedData] = useState<Record<string, any[]>>({});
  const [categories, setCategories] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [rabItems, setRabItems] = useState<any[]>([]);

  // Date Filter
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
      date: new Date(),
      amount: "" as any,
      paymentMethodId: "",
      categoryId: "",
      rabItemId: "no-rab",
      description: ""
  });

  const fetchData = async () => {
      setLoading(true);
      try {
          const [grouped, cats, pms, rabs] = await Promise.all([
              getExpensesGrouped(selectedDate),
              getExpenseCategories(),
              getPaymentMethods(),
              getRabItemsGrouped()
          ]);
          setGroupedData(grouped);
          setCategories(cats);
          setPaymentMethods(pms);
          setRabItems(rabs);
      } catch (error) {
          toast.error("Failed to load data");
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      fetchData();
  }, [selectedDate]);

  const handleCreate = async () => {
      if (!formData.amount || !formData.categoryId || !formData.paymentMethodId) {
          return toast.error("Please fill required fields (Amount, Category, Payment Method)");
      }

      setSubmitting(true);
      try {
          if (editingId) {
             await updateExpense(editingId, {
                date: formData.date,
                amount: formData.amount,
                paymentMethodId: formData.paymentMethodId,
                categoryId: formData.categoryId,
                rabItemId: formData.rabItemId === "no-rab" ? undefined : formData.rabItemId,
                description: formData.description
             });
             toast.success("Expense updated");
          } else {
             await createExpense({
                date: formData.date,
                amount: formData.amount,
                paymentMethodId: formData.paymentMethodId,
                categoryId: formData.categoryId,
                rabItemId: formData.rabItemId === "no-rab" ? undefined : formData.rabItemId,
                description: formData.description
             });
            toast.success("Expense recorded successfully");
          }
          
          setDialogOpen(false);
          setEditingId(null);
          setFormData(prev => ({ ...prev, amount: "", description: "" })); 
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
          rabItemId: item.rabItemId || "no-rab",
          description: item.description || ""
      });
      setDialogOpen(true);
  };

  const confirmDelete = (id: string) => {
      setDeletingId(id);
      setDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
      if(!deletingId) return;
      try {
          await deleteExpense(deletingId);
          toast.success("Deleted successfully");
          fetchData();
      } catch(e: any) { 
          toast.error(e.message || "Failed to delete"); 
      } finally {
          setDeleteDialogOpen(false);
          setDeletingId(null);
      }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Pengeluaran (Expense)</h2>
            <p className="text-muted-foreground">Manage expenses grouped by category.</p>
            
             {/* Date Filter */}
             <div className="flex items-center gap-2 mt-4">
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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" onClick={() => {
                    setFormData({ ...formData, date: new Date(), amount: "", description: "" });
                    setEditingId(null);
                }}>
                    <Plus className="mr-2 h-4 w-4" /> Record Expense
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>{editingId ? "Edit Expense" : "Record New Expense"}</DialogTitle>
                </DialogHeader>

                {/* ... existing form content ... */}
                
                {/* We can rely on existing form content being largely untouched if we only replace header/trigger */}
                
                {/* BUT replace_file_content replaces contiguous blocks. The above replace only covers trigger/header. 
                    I need to do the table separately or include form content in previous step? 
                    I'll do Trigger/Header here. And Table separate. 
                */}
                
                <div className="grid gap-4 py-4">
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
                             <Select value={formData.categoryId} onValueChange={(v) => setFormData(prev => ({ ...prev, categoryId: v }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                </SelectContent>
                             </Select>
                        </div>
                    </div>

                    <div className="space-y-4 border rounded-md p-4 bg-muted/20">
                         <div className="space-y-2">
                            <Label>Link to RAB Item (Optional)</Label>
                            <Select value={formData.rabItemId} onValueChange={(v) => setFormData({...formData, rabItemId: v})}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Budget Item" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="no-rab">-- No Budget Link --</SelectItem>
                                    {rabItems.map(item => (
                                        <SelectItem key={item.id} value={item.id}>
                                            {item.rabCategory?.name} - {item.name} ({formatCurrency(item.total)})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

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
                                    type="number" min="0" 
                                    value={formData.amount}
                                    placeholder="0"
                                    onChange={(e) => setFormData({...formData, amount: e.target.value === "" ? "" : parseInt(e.target.value)})}
                                />
                                <p className="text-xs text-muted-foreground">Masukkan nominal penuh (misal: 10000 untuk 10rb)</p>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input 
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                placeholder="Expense details..."
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={handleCreate} disabled={submitting} variant="destructive">
                        {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Record"}
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
                        Are you sure you want to delete this expense record? This action cannot be undone.
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

      {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : (
          <div className="space-y-8">
              {categories.map((category) => {
                  const categoryData = groupedData[category.name] || [];
                  const categoryTotal = categoryData.reduce((acc: number, cur: any) => acc + cur.amount, 0);

                  return (
                      <Card key={category.id} className="overflow-hidden">
                          <CardHeader className="bg-muted/40 py-4">
                              <div className="flex justify-between items-center">
                                  <CardTitle className="text-lg font-bold uppercase tracking-wider text-rose-700">{category.name}</CardTitle>
                                  <div className="text-sm font-medium text-muted-foreground">
                                      Total: <span className="text-rose-700 font-bold">{formatCurrency(categoryTotal)}</span>
                                  </div>
                              </div>
                          </CardHeader>
                          <CardContent className="p-0">
                               <Table>
                                   <TableHeader>
                                       <TableRow>
                                           <TableHead className="w-[150px]">Date</TableHead>
                                           <TableHead>Description</TableHead>
                                           <TableHead>RAB Link</TableHead>
                                           <TableHead>Method</TableHead>
                                           <TableHead className="text-right">Amount</TableHead>
                                           <TableHead className="w-[100px]"></TableHead>
                                       </TableRow>
                                   </TableHeader>
                                   <TableBody>
                                       {categoryData.length === 0 ? (
                                           <TableRow>
                                               <TableCell colSpan={5} className="text-center text-muted-foreground h-20">No expenses for {category.name}</TableCell>
                                           </TableRow>
                                       ) : (
                                           categoryData.map((item: any) => (
                                               <TableRow key={item.id}>
                                                   <TableCell>{format(new Date(item.date), "dd/MM/yyyy")}</TableCell>
                                                   <TableCell>{item.description || "-"}</TableCell>
                                                   <TableCell>
                                                       {item.rabItem ? (
                                                            <div className="flex flex-col text-xs">
                                                                <span className="font-semibold text-muted-foreground">{item.rabItem.name}</span>
                                                            </div>
                                                       ) : "-"}
                                                   </TableCell>
                                                   <TableCell>
                                                       <span className="px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                                                            {item.paymentMethod?.name || "Unknown"}
                                                       </span>
                                                   </TableCell>
                                                   <TableCell className="text-right font-bold text-rose-600">
                                                       -{formatCurrency(item.amount)}
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
                                       {/* Subtotal */ }
                                       {categoryData.length > 0 && (
                                           <TableRow className="bg-muted/50 font-bold">
                                               <TableCell colSpan={4} className="text-right">Subtotal {category.name}</TableCell>
                                               <TableCell className="text-right text-rose-700">{formatCurrency(categoryTotal)}</TableCell>
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
