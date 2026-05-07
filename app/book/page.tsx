import {
  getAddons,
  getDrinks,
  getServices,
  getStudioSettings,
} from "@/lib/db/catalog";
import { getUpcomingSlots } from "@/lib/db/admin";
import { getLocale } from "@/lib/i18n-server";
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
  const locale = getLocale();
  return (
    <BookingWizard
      services={services}
      addons={addons}
      drinks={drinks}
      slots={slots}
      brandName={settings.brandName}
      phonePlaceholder={settings.phonePlaceholder ?? "+965 5000 0000"}
      locale={locale}
    />
  );
}
