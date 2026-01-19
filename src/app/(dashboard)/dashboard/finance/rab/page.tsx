"use client";

import { useEffect, useState } from "react";
import { getRabs, createRabItem, getRabCategories, deleteRabItem, updateRabItem } from "@/server/actions/finance.actions";
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
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, Loader2, PieChart as PieChartIcon, Trash2, Pencil } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function FinanceRabPage() {
  const [loading, setLoading] = useState(true);
  const [rabs, setRabs] = useState<any[]>([]);
  const [rabCategories, setRabCategories] = useState<any[]>([]);
  const [selectedRabId, setSelectedRabId] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
      rabCategoryId: "",
      name: "",
      quantity: 1,
      unit: "Pcs",
      unitPrice: 0
  });

  const fetchData = async () => {
      setLoading(true);
      try {
          const [resRabs, resCats] = await Promise.all([
              getRabs(),
              getRabCategories()
          ]);
          setRabs(resRabs);
          setRabCategories(resCats);
          if (resRabs.length > 0 && !selectedRabId) {
              setSelectedRabId(resRabs[0].id);
          }
      } catch (error) {
          toast.error("Failed to load RAB data");
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      fetchData();
  }, []);

  const handleCreateItem = async () => {
      if (!selectedRabId) return toast.error("No RAB selected");
      if (!formData.name || !formData.rabCategoryId || formData.unitPrice === 0) {
          return toast.error("Please fill all fields");
      }
      
      setSubmitting(true);
      try {
          if (editingId) {
             await updateRabItem(editingId, {
                rabCategoryId: formData.rabCategoryId,
                name: formData.name,
                quantity: formData.quantity,
                unit: formData.unit,
                unitPrice: formData.unitPrice
             });
             toast.success("Item updated");
          } else {
             await createRabItem({
                rabId: selectedRabId,
                rabCategoryId: formData.rabCategoryId,
                name: formData.name,
                quantity: formData.quantity,
                unit: formData.unit,
                unitPrice: formData.unitPrice
             });
             toast.success("Item added");
          }

          setDialogOpen(false);
          setEditingId(null);
          setFormData({ ...formData, name: "", quantity: 1, unitPrice: 0 });
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
          rabCategoryId: item.rabCategoryId,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice
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
          await deleteRabItem(deletingId);
          toast.success("Item deleted");
          fetchData();
      } catch(e: any) { 
          toast.error(e.message || "Failed to delete"); 
      } finally {
          setDeleteDialogOpen(false);
          setDeletingId(null);
      }
  };

  const selectedRab = rabs.find(r => r.id === selectedRabId);

  // Group items by category
  const groupedItems: Record<string, any[]> = {};
  if (selectedRab) {
      selectedRab.items.forEach((item: any) => {
          const catName = item.rabCategory?.name || "Uncategorized";
          if (!groupedItems[catName]) groupedItems[catName] = [];
          groupedItems[catName].push(item);
      });
  }

  // Calculate totals for Chart
  const chartData = Object.keys(groupedItems).map(catName => {
        const total = groupedItems[catName].reduce((acc, curr) => acc + curr.total, 0);
        return { name: catName, value: total };
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  const grandTotal = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Rencana Anggaran Biaya (RAB)</h2>
            <p className="text-muted-foreground">Manage project budget allocation.</p>
        </div>
        <div className="flex gap-2">
            {rabs.length > 1 ? (
                <Select value={selectedRabId} onValueChange={setSelectedRabId}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select RAB" />
                    </SelectTrigger>
                    <SelectContent>
                        {rabs.map(r => <SelectItem key={r.id} value={r.id}>{r.title} ({r.year})</SelectItem>)}
                    </SelectContent>
                </Select>
            ) : selectedRab ? (
                 <div className="flex items-center px-4 py-2 bg-muted/50 rounded-md border text-sm font-medium">
                    {selectedRab.title} ({selectedRab.year})
                 </div>
            ) : null}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                    <Button disabled={!selectedRabId} onClick={() => {
                        setEditingId(null);
                        setFormData({ ...formData, name: "", quantity: 1, unitPrice: 0 });
                    }}>
                        <Plus className="mr-2 h-4 w-4" /> Add Item
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Edit Item" : "Add Budget Item"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={formData.rabCategoryId} onValueChange={(v) => setFormData({...formData, rabCategoryId: v})}>
                                <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                                <SelectContent>
                                    {rabCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Item Name</Label>
                            <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Spanduk" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Quantity</Label>
                                <Input type="number" min="1" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})} />
                            </div>
                            <div className="space-y-2">
                                <Label>Unit</Label>
                                <Input value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} placeholder="e.g. Pcs" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Unit Price (Rp)</Label>
                            <Input type="number" min="0" value={formData.unitPrice} onChange={(e) => setFormData({...formData, unitPrice: parseInt(e.target.value)})} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCreateItem} disabled={submitting}>
                            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Add Item"}
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
                           Are you sure you want to delete this RAB item? 
                           If this item is used in any expense records, deletion will be blocked safely.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={executeDelete}>
                            Delete Item
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
      </div>

      {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : !selectedRab ? (
          <div className="text-center py-20 text-muted-foreground">No RAB Found. Please seed data or create one.</div>
      ) : (
          <div className="space-y-8 animate-in fade-in-50">
              {/* Cards per Category */}
              {Object.keys(groupedItems).sort().map(catName => {
                  const items = groupedItems[catName];
                  const subtotal = items.reduce((acc, curr) => acc + curr.total, 0);

                  return (
                      <Card key={catName}>
                          <CardHeader className="bg-muted/30 py-4">
                              <div className="flex justify-between items-center">
                                  <CardTitle className="text-lg font-bold">{catName}</CardTitle>
                                  <span className="font-bold text-primary">{formatCurrency(subtotal)}</span>
                              </div>
                          </CardHeader>
                          <CardContent className="p-0">
                               <Table>
                                   <TableHeader>
                                       <TableRow>
                                           <TableHead>Item</TableHead>
                                           <TableHead className="text-right">Qty</TableHead>
                                           <TableHead>Unit</TableHead>
                                           <TableHead className="text-right">Price</TableHead>
                                           <TableHead className="text-right">Total</TableHead>
                                           <TableHead className="w-[100px]"></TableHead>
                                       </TableRow>
                                   </TableHeader>
                                   <TableBody>
                                       {items.map((item: any) => (
                                           <TableRow key={item.id}>
                                               <TableCell>{item.name}</TableCell>
                                               <TableCell className="text-right">{item.quantity}</TableCell>
                                               <TableCell>{item.unit}</TableCell>
                                               <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                                               <TableCell className="text-right font-medium">{formatCurrency(item.total)}</TableCell>
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
                                       ))}
                                   </TableBody>
                               </Table>
                          </CardContent>
                      </Card>
                  )
              })}

              {/* Summary Section */}
              <div className="grid md:grid-cols-2 gap-8">
                  <Card>
                      <CardHeader>
                          <CardTitle>Allocation Ratio</CardTitle>
                      </CardHeader>
                      <CardContent className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                  <Pie
                                      data={chartData}
                                      cx="50%"
                                      cy="50%"
                                      labelLine={false}
                                      outerRadius={80}
                                      fill="#8884d8"
                                      dataKey="value"
                                      label={({ name, percent }: { name?: string | number; percent?: number }) => `${((percent || 0) * 100).toFixed(0)}%`}
                                  >
                                      {chartData.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                      ))}
                                  </Pie>
                                  <Tooltip formatter={(value: number | undefined) => formatCurrency(value ?? 0)} />
                                  <Legend />
                              </PieChart>
                          </ResponsiveContainer>
                      </CardContent>
                  </Card>

                  <Card>
                      <CardHeader>
                          <CardTitle>Budget Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                          <Table>
                               <TableHeader>
                                   <TableRow>
                                       <TableHead>Category</TableHead>
                                       <TableHead className="text-right">Allocation</TableHead>
                                   </TableRow>
                               </TableHeader>
                               <TableBody>
                                   {chartData.map((d) => (
                                       <TableRow key={d.name}>
                                           <TableCell className="font-medium">{d.name}</TableCell>
                                           <TableCell className="text-right">{formatCurrency(d.value)}</TableCell>
                                       </TableRow>
                                   ))}
                                   <TableRow className="font-bold text-lg bg-muted/50">
                                       <TableCell>Grand Total</TableCell>
                                       <TableCell className="text-right">{formatCurrency(grandTotal)}</TableCell>
                                   </TableRow>
                               </TableBody>
                          </Table>
                      </CardContent>
                  </Card>
              </div>
          </div>
      )}
    </div>
  );
}
