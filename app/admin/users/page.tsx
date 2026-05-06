import { redirect } from "next/navigation";
import { getAdminUsers, getCurrentAdmin } from "@/lib/db/admin";
import { UsersManager } from "./UsersManager";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getCurrentAdmin();
  if (!session) redirect("/admin/login");
  if (session.role !== "owner") {
    return (
      <div className="card text-center text-sm text-gray-700">
        <p className="font-bold text-red-600">403 — Owner only</p>
        <p className="mt-2">
          Managing admin accounts requires owner role.
        </p>
      </div>
    );
  }

  const users = await getAdminUsers();
  return <UsersManager users={users} currentUserId={session.userId} />;
}
