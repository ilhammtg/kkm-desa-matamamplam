import { getMembers, getPositionsAndDivisions } from "@/server/actions/member.actions";
import { MembersTable } from "@/components/dashboard/members/MembersTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kelola Anggota | Dashboard",
};

export default async function MembersPage() {
  const [members, divisions] = await Promise.all([
    getMembers(),
    getPositionsAndDivisions(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Struktur Organisasi</h1>
          <p className="text-muted-foreground">
            Kelola data anggota, divisi, dan jabatan.
          </p>
        </div>
      </div>

      <MembersTable members={members} divisionsData={divisions} />
    </div>
  );
}
