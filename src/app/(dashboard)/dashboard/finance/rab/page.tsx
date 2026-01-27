"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getRabs, createRab, createRabItem, getRabCategories, deleteRabItem, updateRabItem, deleteRab } from "@/server/actions/finance.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
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
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, Loader2, Trash2, Pencil, Calendar as CalendarIcon, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

// Helper to format date from DB (UTC) for display
function formatDbDate(dbDate: Date): string {
  // Extract UTC date components to avoid timezone shifts
  const year = dbDate.getUTCFullYear();
  const month = dbDate.getUTCMonth();
  const day = dbDate.getUTCDate();
  const localDate = new Date(year, month, day);
  return format(localDate, 'dd MMMM yyyy', { locale: idLocale });
}

export default function FinanceRabPage() {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");
  
  const [date, setDate] = useState<Date>(() => {
      if (dateParam) {
          const [year, month, day] = dateParam.split('-').map(Number);
          return new Date(year, month - 1, day);
      }
      return new Date();
  });
  const [loading, setLoading] = useState(true);
  const [rabs, setRabs] = useState<any[]>([]);
  const [rabCategories, setRabCategories] = useState<any[]>([]);
  
  // Create RAB Dialog
  const [createRabOpen, setCreateRabOpen] = useState(false);
  const [newRabCategory, setNewRabCategory] = useState("");

  // Create Item Dialog
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [activeRabId, setActiveRabId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  
  // Changed state to allow empty string for inputs
  const [itemForm, setItemForm] = useState<{
      name: string,
      quantity: number | "",
      unit: string,
      unitPrice: number | ""
  }>({
      name: "",
      quantity: "",
      unit: "Pcs",
      unitPrice: ""
  });

  const fetchData = async () => {
      setLoading(true);
      try {
          const [resRabs, resCats] = await Promise.all([
              getRabs(date),
              getRabCategories()
          ]);
          setRabs(resRabs);
          setRabCategories(resCats);
      } catch (error) {
          toast.error("Failed to load RAB data");
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      fetchData();
  }, [date]);

  const handleCreateRab = async () => {
      if (!newRabCategory) return toast.error("Select a category");
      setSubmitting(true);
      try {
          await createRab({ date, rabCategoryId: newRabCategory });
          toast.success("Budget plan created");
          setCreateRabOpen(false);
          setNewRabCategory("");
          fetchData();
      } catch (e: any) {
          toast.error(e.message);
      } finally {
          setSubmitting(false);
      }
  };

  const handleDeleteRab = async (id: string, name: string) => {
      if (!confirm(`Are you sure you want to delete budget plan for "${name}"? This will delete all items in it.`)) return;
      try {
          await deleteRab(id);
          toast.success("Budget plan deleted");
          fetchData();
      } catch (e: any) {
          toast.error(e.message);
      }
  };

  const openItemDialog = (rabId: string, item: any = null) => {
      setActiveRabId(rabId);
      setEditingItem(item);
      if (item) {
          setItemForm({
              name: item.name,
              quantity: item.quantity,
              unit: item.unit,
              unitPrice: item.unitPrice
          });
      } else {
          setItemForm({ name: "", quantity: "", unit: "Pcs", unitPrice: "" });
      }
      setItemDialogOpen(true);
  };

  const handleSaveItem = async () => {
      if (!activeRabId) return;
      setSubmitting(true);
      try {
          // Default to 1 for quantity and 0 for price if empty
          const finalQuantity = itemForm.quantity === "" ? 1 : itemForm.quantity;
          const finalUnitPrice = itemForm.unitPrice === "" ? 0 : itemForm.unitPrice;

          if (editingItem) {
              await updateRabItem(editingItem.id, {
                  ...itemForm,
                  quantity: finalQuantity,
                  unitPrice: finalUnitPrice
              });
              toast.success("Item updated");
          } else {
              await createRabItem({
                  rabId: activeRabId,
                  ...itemForm,
                  quantity: finalQuantity,
                  unitPrice: finalUnitPrice
              });
              toast.success("Item added");
          }
          setItemDialogOpen(false);
          fetchData();
      } catch (e: any) {
          toast.error(e.message);
      } finally {
          setSubmitting(false);
      }
  };

  const handleDeleteItem = async (id: string, rabId: string) => {
      const rab = rabs.find(r => r.id === rabId);
      if (rab?.status === 'REALIZED') return toast.error("Cannot delete item from Realized RAB");
      
      if (!confirm("Delete this item?")) return;
      try {
          await deleteRabItem(id);
          toast.success("Item deleted");
          fetchData();
      } catch (e: any) {
          toast.error(e.message);
      }
  };

  const totalBudget = rabs.reduce((acc, r) => acc + r.total, 0);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Daily Budget (RAB Harian)</h2>
            <p className="text-muted-foreground">Plan daily operational budgets.</p>
        </div>
        <div className="flex items-center gap-2">
            <div className="relative">
                <CalendarIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    type="date" 
                    value={format(date, 'yyyy-MM-dd')} 
                    onChange={(e) => {
                        if (e.target.value) {
                            // Parse date string as local timezone to avoid timezone shift
                            const [year, month, day] = e.target.value.split('-').map(Number);
                            const newDate = new Date(year, month - 1, day);
                            setDate(newDate);
                        } else {
                            setDate(new Date());
                        }
                    }} 
                    className="pl-8 w-[180px]"
                />
            </div>
            <Dialog open={createRabOpen} onOpenChange={setCreateRabOpen}>
                <DialogTrigger asChild>
                    <Button><Plus className="mr-2 h-4 w-4" /> Add Budget Plan</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Daily Budget</DialogTitle>
                        <CardDescription>
                            Create a budget plan for {format(date, 'dd MMMM yyyy')}.
                        </CardDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label>Select Category</Label>
                        <Select value={newRabCategory} onValueChange={setNewRabCategory}>
                            <SelectTrigger><SelectValue placeholder="Reason / Category" /></SelectTrigger>
                            <SelectContent>
                                {rabCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCreateRab} disabled={submitting}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
      </div>

      {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : rabs.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground border rounded-lg bg-muted/10">
              No budget plans for {format(date, 'dd MMMM yyyy', { locale: idLocale })}. 
              <br/>Click "Add Budget Plan" to start.
          </div>
      ) : (
          <div className="space-y-6 animate-in fade-in-50">
               {/* Summary Card */}
              <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="flex justify-between items-center py-4">
                      <span className="font-medium text-lg">Total Budget for {rabs[0] ? formatDbDate(new Date(rabs[0].date)) : format(date, 'dd MMMM yyyy', { locale: idLocale })}</span>
                      <span className="font-bold text-2xl text-primary">{formatCurrency(totalBudget)}</span>
                  </CardContent>
              </Card>

              {rabs.map(rab => (
                  <Card key={rab.id} className={rab.status === 'REALIZED' ? 'opacity-80' : ''}>
                      <CardHeader className="py-4 bg-muted/30 flex flex-row items-center justify-between space-y-0">
                          <div className="flex items-center gap-3">
                              <CardTitle className="text-base">{rab.rabCategory.name}</CardTitle>
                              {rab.status === 'REALIZED' ? (
                                  <Badge variant="default" className="bg-green-600">Paid / Realized</Badge>
                              ) : (
                                  <Badge variant="outline">Planned</Badge>
                              )}
                          </div>
                          <div className="flex items-center gap-4">
                               <span className="font-bold">{formatCurrency(rab.total)}</span>
                               {rab.status !== 'REALIZED' && (
                                   <div className="flex gap-2">
                                       <Button size="sm" variant="secondary" onClick={() => openItemDialog(rab.id)}>
                                           <Plus className="h-3 w-3 mr-1" /> Item
                                       </Button>
                                       <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteRab(rab.id, rab.rabCategory.name)}>
                                           <Trash2 className="h-4 w-4" />
                                       </Button>
                                   </div>
                               )}
                          </div>
                      </CardHeader>
                      <CardContent className="p-0">
                           <Table>
                               <TableHeader>
                                   <TableRow>
                                       <TableHead className="pl-6">Item Name</TableHead>
                                       <TableHead className="text-right">Qty</TableHead>
                                       <TableHead>Unit</TableHead>
                                       <TableHead className="text-right">Price</TableHead>
                                       <TableHead className="text-right pr-6">Total</TableHead>
                                       <TableHead className="w-[50px]"></TableHead>
                                   </TableRow>
                               </TableHeader>
                               <TableBody>
                                   {rab.items.length === 0 ? (
                                       <TableRow>
                                           <TableCell colSpan={6} className="text-center text-muted-foreground h-20">
                                               No items yet.
                                           </TableCell>
                                       </TableRow>
                                   ) : (
                                       rab.items.map((item: any) => (
                                           <TableRow key={item.id}>
                                               <TableCell className="pl-6">{item.name}</TableCell>
                                               <TableCell className="text-right">{item.quantity}</TableCell>
                                               <TableCell>{item.unit}</TableCell>
                                               <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                                               <TableCell className="text-right pr-6 font-medium">{formatCurrency(item.total)}</TableCell>
                                               <TableCell>
                                                   {rab.status !== 'REALIZED' && (
                                                       <div className="flex justify-end gap-1">
                                                           <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openItemDialog(rab.id, item)}>
                                                               <Pencil className="h-3 w-3" />
                                                           </Button>
                                                           <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDeleteItem(item.id, rab.id)}>
                                                               <Trash2 className="h-3 w-3" />
                                                           </Button>
                                                       </div>
                                                   )}
                                               </TableCell>
                                           </TableRow>
                                       ))
                                   )}
                               </TableBody>
                           </Table>
                      </CardContent>
                  </Card>
              ))}
          </div>
      )}

      {/* Item Dialog */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>{editingItem ? "Edit Item" : "Add Item"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                   <div>
                       <Label>Name</Label>
                       <Input value={itemForm.name} onChange={e => setItemForm({...itemForm, name: e.target.value})} placeholder="Item description" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                       <div>
                           <Label>Quantity (Jumlah)</Label>
                           <Input 
                                type="number" 
                                min="1" 
                                value={itemForm.quantity} 
                                placeholder="1"
                                onChange={e => setItemForm({...itemForm, quantity: e.target.value === "" ? "" : parseInt(e.target.value)})} 
                           />
                       </div>
                       <div>
                           <Label>Unit (Satuan)</Label>
                           <Input value={itemForm.unit} placeholder="Pcs, Kg, Liter..." onChange={e => setItemForm({...itemForm, unit: e.target.value})} />
                       </div>
                   </div>
                   <div>
                       <Label>Unit Price (Harga Satuan)</Label>
                       <Input 
                            type="number" 
                            min="0" 
                            value={itemForm.unitPrice} 
                            placeholder="0"
                            onChange={e => setItemForm({...itemForm, unitPrice: e.target.value === "" ? "" : parseInt(e.target.value)})} 
                       />
                       <p className="text-xs text-muted-foreground mt-1">
                           Price per unit, not total price.
                       </p>
                   </div>
                   
                   {/* Live Calculation */}
                   <div className="bg-muted/30 p-3 rounded border flex justify-between items-center">
                        <span className="text-sm font-medium">Total Price:</span>
                        <span className="text-lg font-bold text-primary">
                            {formatCurrency(
                                (itemForm.quantity === "" ? 0 : itemForm.quantity) * 
                                (itemForm.unitPrice === "" ? 0 : itemForm.unitPrice)
                            )}
                        </span>
                   </div>
              </div>
              <DialogFooter>
                  <Button onClick={handleSaveItem} disabled={submitting}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}
