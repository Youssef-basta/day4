import {
  getAddons,
  getDrinks,
  getServices,
  getStudioSettings,
} from "@/lib/db/catalog";
import { getUpcomingSlots } from "@/lib/db/admin";
import { BookingWizard } from "./BookingWizard";

export const dynamic = "force-dynamic";

export default async function BookPage() {
  const [services, addons, drinks, slots, settings] = await Promise.all([
    getServices(),
    getAddons(),
    getDrinks(),
    getUpcomingSlots(14),
    getStudioSettings(),
  ]);
  return (
    <BookingWizard
      services={services}
      addons={addons}
      drinks={drinks}
      slots={slots}
      brandName={settings.brandName}
      phonePlaceholder={settings.phonePlaceholder ?? "+965 5000 0000"}
    />
  );
}
