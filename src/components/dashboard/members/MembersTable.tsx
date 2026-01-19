"use client";

import { useState } from "react";
import { Member, Position, Division } from "@prisma/client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil, Trash2, Plus } from "lucide-react";
import { deleteMember } from "@/server/actions/member.actions";
import { toast } from "sonner";
import { MemberDialog } from "./MemberDialog";
import { useTransition } from "react";

interface MemberWithRelations extends Member {
  position: Position & { division: Division | null };
}

interface MembersTableProps {
  members: MemberWithRelations[];
  divisionsData: any[]; // Type properly if possible, but passed from server
}

export function MembersTable({ members, divisionsData }: MembersTableProps) {
  // const { toast } = useToast(); // Removed in favor of sonner
  const [isPending, startTransition] = useTransition();
  const [editingMember, setEditingMember] = useState<MemberWithRelations | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDelete = async (member: MemberWithRelations) => {
    const confirmDelete = window.confirm(`Apakah anda yakin ingin menghapus anggota ${member.name}?`);
    if (!confirmDelete) return;

    startTransition(async () => {
      try {
        await deleteMember(member.id);
        toast.success("Anggota berhasil dihapus.");
      } catch (error) {
        toast.error("Gagal menghapus anggota.");
      }
    });
  };

  const openCreateDialog = () => {
    setEditingMember(null);
    setIsDialogOpen(true);
  }

  const openEditDialog = (member: MemberWithRelations) => {
    setEditingMember(member);
    setIsDialogOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold tracking-tight">Daftar Anggota</h2>
        <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Anggota
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Foto</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>NPM</TableHead>
              <TableHead>Jabatan</TableHead>
              <TableHead>Divisi</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                        Belum ada anggota.
                    </TableCell>
                </TableRow>
            ) : (
                members.map((member) => (
                <TableRow key={member.id}>
                    <TableCell>
                    <Avatar>
                        <AvatarImage src={member.photoUrl || ""} />
                        <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.npm}</TableCell>
                    <TableCell>{member.position.title}</TableCell>
                    <TableCell>
                        {member.position.division?.name || "Inti"}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(member)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:text-destructive/80"
                        onClick={() => handleDelete(member)}
                        disabled={isPending}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>

      <MemberDialog 
        isOpen={isDialogOpen}
        onChange={setIsDialogOpen}
        initialData={editingMember}
        divisionsData={divisionsData}
      />
    </div>
  );
}
