import {
  getAddons,
  getDrinks,
  getOpenSlots,
  getServices,
  getStudioSettings,
} from "@/lib/db/catalog";
import { BookingWizard } from "./BookingWizard";

export const dynamic = "force-dynamic";

export default async function BookPage() {
  const [services, addons, drinks, slots, settings] = await Promise.all([
    getServices(),
    getAddons(),
    getDrinks(),
    getOpenSlots(),
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
