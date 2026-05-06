import { getServicesAdmin } from "@/lib/db/admin";
import { ServicesManager } from "./ServicesManager";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const services = await getServicesAdmin();
  return <ServicesManager services={services} />;
}
