"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus, GripVertical, Check } from "lucide-react";

export interface ListItem {
  id: string; // Internal ID for keying
  title: string;
  description: string;
  icon?: string;
}

interface ListManagerProps {
  label: string;
  items: ListItem[];
  onChange: (items: ListItem[]) => void;
  withIcon?: boolean;
}

export function ListManager({ label, items, onChange, withIcon = false }: ListManagerProps) {
  const [localItems, setLocalItems] = useState<ListItem[]>(items.length > 0 ? items : []);

  useEffect(() => {
    setLocalItems(items.length > 0 ? items : []);
  }, [items]);

  const handleAdd = () => {
    const newItem: ListItem = {
      id: crypto.randomUUID(),
      title: "",
      description: "",
      icon: withIcon ? "" : undefined,
    };
    const newItems = [...localItems, newItem];
    setLocalItems(newItems);
    onChange(newItems);
  };

  const handleRemove = (id: string) => {
    const newItems = localItems.filter((item) => item.id !== id);
    setLocalItems(newItems);
    onChange(newItems);
  };

  const handleChange = (id: string, field: keyof ListItem, value: string) => {
    const newItems = localItems.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setLocalItems(newItems);
    onChange(newItems);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          className="h-8"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      <div className="space-y-4">
        {localItems.map((item, index) => (
          <Card key={item.id} className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex gap-4 items-start">
                 <div className="mt-2 text-muted-foreground cursor-move">
                    <GripVertical className="h-5 w-5" />
                 </div>
                 
                 <div className="flex-1 space-y-3">
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <Input 
                                placeholder="Title"
                                value={item.title}
                                onChange={(e) => handleChange(item.id, "title", e.target.value)}
                                className="font-semibold"
                            />
                        </div>
                        {withIcon && (
                             <div className="w-1/3">
                                <Input 
                                    placeholder="Icon Name (e.g. Users)"
                                    value={item.icon || ""}
                                    onChange={(e) => handleChange(item.id, "icon", e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                    
                    <Textarea 
                        placeholder="Description..."
                        value={item.description}
                        onChange={(e) => handleChange(item.id, "description", e.target.value)}
                        rows={2}
                    />
                 </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleRemove(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {localItems.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-8 border rounded-lg border-dashed">
                No items added yet. Click valid button to add one.
            </div>
        )}
      </div>
    </div>
  );
}
