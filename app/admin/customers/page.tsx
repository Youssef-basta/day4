import { getCustomers } from "@/lib/db/admin";
import { CustomersList } from "./CustomersList";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await getCustomers();
  return <CustomersList customers={customers} />;
}
