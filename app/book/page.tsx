import {
  getAddons,
  getDrinks,
  getServices,
  getStudioSettings,
} from "@/lib/db/catalog";
import { getUpcomingSlots } from "@/lib/db/admin";
import { getCustomerProfile, getCustomerSession } from "@/lib/db/customer";
import { getLocale } from "@/lib/i18n-server";
import { BookingWizard } from "./BookingWizard";

export const dynamic = "force-dynamic";

export default async function BookPage({
  searchParams,
}: {
  searchParams?: { service?: string };
}) {
  const session = await getCustomerSession();
  const [services, addons, drinks, slots, settings, profile] = await Promise.all([
    getServices(),
    getAddons(),
    getDrinks(),
    getUpcomingSlots(14),
    getStudioSettings(),
    session ? getCustomerProfile(session.phone) : Promise.resolve(null),
  ]);
  const locale = getLocale();

  const initialName = profile?.name ?? session?.name ?? "";
  // Phone is stored as +9655XXXXXXXX; strip prefix for the 8-digit input.
  const initialPhoneDigits = session?.phone?.replace(/\D/g, "").slice(-8) ?? "";

  // ?service=X pre-selects a service (used by the "Book again" CTA).
  const preselectServiceId =
    searchParams?.service && services.some((s) => s.id === searchParams.service)
      ? searchParams.service
      : null;

  return (
    <BookingWizard
      services={services}
      addons={addons}
      drinks={drinks}
      slots={slots}
      brandName={settings.brandName}
      phonePlaceholder={settings.phonePlaceholder ?? "+965 5000 0000"}
      locale={locale}
      initialName={initialName}
      initialPhone={initialPhoneDigits}
      preselectServiceId={preselectServiceId}
      favoriteServiceIds={profile?.favoriteServiceIds ?? []}
      session={session}
    />
  );
}
