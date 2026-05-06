import {
  getAddons,
  getOpenSlots,
  getServices,
  getStudioSettings,
} from "@/lib/db/catalog";
import { BookingWizard } from "./BookingWizard";

export const dynamic = "force-dynamic";

export default async function BookPage() {
  const [services, addons, slots, settings] = await Promise.all([
    getServices(),
    getAddons(),
    getOpenSlots(),
    getStudioSettings(),
  ]);
  return (
    <BookingWizard
      services={services}
      addons={addons}
      slots={slots}
      brandName={settings.brandName}
      phonePlaceholder={settings.phonePlaceholder ?? "+965 5000 0000"}
    />
  );
}
