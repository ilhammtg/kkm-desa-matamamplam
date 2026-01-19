"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/image-upload";
import { createMember, updateMember } from "@/server/actions/member.actions";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  npm: z.string().min(5, "NPM minimal 5 karakter"),
  major: z.string().min(2, "Jurusan diperlukan"),
  divisionId: z.string().min(1, "Divisi harus dipilih"),
  positionId: z.string().min(1, "Jabatan harus dipilih"),
  photoUrl: z.string().optional(),
});

interface MemberDialogProps {
  isOpen: boolean;
  onChange: (open: boolean) => void;
  initialData?: any; // MemberWithRelations
  divisionsData: any[];
}

export function MemberDialog({
  isOpen,
  onChange,
  initialData,
  divisionsData,
}: MemberDialogProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      npm: "",
      major: "",
      divisionId: "",
      positionId: "",
      photoUrl: "",
    },
  });

  // Watch division ID to filter positions
  const selectedDivisionId = form.watch("divisionId");
  const currentDivision = divisionsData.find(d => d.id === selectedDivisionId);
  const availablePositions = currentDivision ? currentDivision.positions : [];

  useEffect(() => {
    if (initialData) {
      // Find which division this position belongs to
        // Because of the simplified relation in member -> position (but position -> division),
        // we can infer division from member.position.divisionId
      const divId = initialData.position?.divisionId || 
                    divisionsData.find(d => d.positions.some((p: any) => p.id === initialData.positionId))?.id || "";

      form.reset({
        name: initialData.name,
        npm: initialData.npm,
        major: initialData.major,
        divisionId: divId, 
        positionId: initialData.positionId,
        photoUrl: initialData.photoUrl || "",
      });
    } else {
      form.reset({
        name: "",
        npm: "",
        major: "",
        divisionId: "",
        positionId: "",
        photoUrl: "",
      });
    }
  }, [initialData, form, divisionsData, isOpen]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log("MemberDialog onSubmit values:", values); // DEBUG LOG
    startTransition(async () => {
      try {
        if (initialData) {
          await updateMember(initialData.id, values);
          toast.success("Data anggota diperbarui");
        } else {
          await createMember(values);
          toast.success("Anggota baru ditambahkan");
        }
        onChange(false);
        if (!initialData) form.reset();
      } catch (error: any) {
        toast.error(error.message || "Terjadi kesalahan");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Anggota" : "Tambah Anggota"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField
              control={form.control}
              name="photoUrl"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center">
                   <FormLabel>Foto Profil</FormLabel>
                   <FormControl>
                        <ImageUpload 
                            value={field.value || ""}
                            onChange={(url) => field.onChange(url)}
                        />
                   </FormControl>
                   <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Nama Lengkap</FormLabel>
                    <FormControl>
                        <Input placeholder="Nama..." {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                control={form.control}
                name="npm"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>NPM</FormLabel>
                    <FormControl>
                        <Input placeholder="NPM..." {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <FormField
              control={form.control}
              name="major"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jurusan/Prodi</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Teknik Informatika" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="divisionId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Divisi</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih Divisi" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {divisionsData.map((div) => (
                                <SelectItem key={div.id} value={div.id}>
                                    {div.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="positionId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Jabatan</FormLabel>
                    <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value} 
                        value={field.value}
                        disabled={!selectedDivisionId}
                    >
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih Jabatan" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {availablePositions.map((pos: any) => (
                                <SelectItem key={pos.id} value={pos.id}>
                                    {pos.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
             </div>

            <div className="flex justify-end pt-4">
               <Button type="button" variant="outline" onClick={() => onChange(false)} className="mr-2">
                 Batal
               </Button>
               <Button type="submit" disabled={isPending}>
                 {isPending ? "Menyimpan..." : "Simpan"}
               </Button>
            </div>

          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
