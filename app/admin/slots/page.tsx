import { getAllBookings, getAllSlots } from "@/lib/db/admin";
import { SlotsManager } from "./SlotsManager";

export const dynamic = "force-dynamic";

export default async function AdminSlotsPage() {
  const [slots, bookings] = await Promise.all([
    getAllSlots(),
    getAllBookings(),
  ]);
  return <SlotsManager slots={slots} bookings={bookings} />;
}
