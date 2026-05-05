import { getAddons, getOpenSlots, getServices } from "@/lib/db/catalog";
import { BookingWizard } from "./BookingWizard";

export const dynamic = "force-dynamic";

export default async function BookPage() {
  const [services, addons, slots] = await Promise.all([
    getServices(),
    getAddons(),
    getOpenSlots(),
  ]);
  return <BookingWizard services={services} addons={addons} slots={slots} />;
}
