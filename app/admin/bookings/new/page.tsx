import {
  getAddonsAdmin,
  getDrinksAdmin,
  getServicesAdmin,
  getStaffActive,
  getUpcomingSlots,
} from "@/lib/db/admin";
import { NewBookingForm } from "./NewBookingForm";

export const dynamic = "force-dynamic";

export default async function AdminNewBookingPage() {
  const [services, addons, drinks, slots, staff] = await Promise.all([
    getServicesAdmin(),
    getAddonsAdmin(),
    getDrinksAdmin(),
    getUpcomingSlots(14),
    getStaffActive(),
  ]);
  return (
    <NewBookingForm
      services={services}
      addons={addons}
      drinks={drinks}
      slots={slots}
      staff={staff}
    />
  );
}
