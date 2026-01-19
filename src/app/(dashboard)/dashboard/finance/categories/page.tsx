"use client";

import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { 
    getIncomeCategories, 
    getExpenseCategories, 
    createIncomeCategory, 
    createExpenseCategory,
    deleteIncomeCategory,
    deleteExpenseCategory
} from "@/server/actions/finance.actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function FinanceCategoriesPage() {
  const [incomeCats, setIncomeCats] = useState<any[]>([]);
  const [expenseCats, setExpenseCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("income"); // income | expense
  const [catName, setCatName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [inc, exp] = await Promise.all([
          getIncomeCategories(),
          getExpenseCategories()
      ]);
      setIncomeCats(inc);
      setExpenseCats(exp);
    } catch (error) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
      if (!catName) return toast.error("Category name required");
      setSubmitting(true);
      try {
          if (activeTab === "income") {
              await createIncomeCategory(catName);
          } else {
              await createExpenseCategory(catName);
          }
          toast.success("Category created");
          setCatName("");
          setDialogOpen(false);
          fetchData();
      } catch (error: any) {
          toast.error(error.message);
      } finally {
          setSubmitting(false);
      }
  };

  const handleDelete = async (id: string, type: "income" | "expense") => {
      if (!confirm("Are you sure? This might affect existing records.")) return;
      try {
          if (type === "income") await deleteIncomeCategory(id);
          else await deleteExpenseCategory(id);
          toast.success("Category deleted");
          fetchData();
      } catch (error: any) {
          toast.error("Failed to delete (Category might be in use)");
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Finance Categories</h2>
            <p className="text-muted-foreground">Manage storage buckets for your financial records.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Category
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add {activeTab === "income" ? "Income" : "Expense"} Category</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <Label>Category Name</Label>
                    <Input 
                        value={catName} 
                        onChange={(e) => setCatName(e.target.value)} 
                        placeholder={activeTab === "income" ? "e.g. Kas Anggota" : "e.g. Konsumsi Rapat"}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                        Creating for: <span className="font-bold uppercase">{activeTab}</span>
                    </p>
                </div>
                <DialogFooter>
                    <Button onClick={handleCreate} disabled={submitting}>
                        {submitting ? "Saving..." : "Save"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="income">Income Categories</TabsTrigger>
          <TabsTrigger value="expense">Expense Categories</TabsTrigger>
        </TabsList>
        
        <TabsContent value="income">
            <Card>
                <CardHeader>
                    <CardTitle>Income Categories</CardTitle>
                    <CardDescription>Sources of funds (Kas, Hibah, etc.)</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {incomeCats.map((c, i) => (
                                <TableRow key={c.id}>
                                    <TableCell className="w-[50px]">{i+1}</TableCell>
                                    <TableCell className="font-medium">{c.name}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id, "income")}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="expense">
            <Card>
                <CardHeader>
                    <CardTitle>Expense Categories</CardTitle>
                    <CardDescription>Types of expenditures (Konsumsi, Transport, etc.)</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {expenseCats.map((c, i) => (
                                <TableRow key={c.id}>
                                    <TableCell className="w-[50px]">{i+1}</TableCell>
                                    <TableCell className="font-medium">{c.name}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id, "expense")}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
