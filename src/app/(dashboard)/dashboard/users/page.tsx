import { getUsers } from "@/server/actions/users.actions";
import { UsersTable } from "@/components/dashboard/users/UsersTable";
import { Suspense } from "react";

export default async function DashboardUsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
      </div>

      <Suspense fallback={<div>Loading users...</div>}>
        <UsersTable users={users} />
      </Suspense>
    </div>
  );
}
