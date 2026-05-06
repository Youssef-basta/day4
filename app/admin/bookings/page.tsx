import {
  getAllBookings,
  getAllSlots,
  getServicesAdmin,
  getStaffAll,
} from "@/lib/db/admin";
import { BookingsList } from "./BookingsList";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const [bookings, services, slots, staff] = await Promise.all([
    getAllBookings(),
    getServicesAdmin(),
    getAllSlots(),
    getStaffAll(),
  ]);
  return (
    <BookingsList
      bookings={bookings}
      services={services}
      slots={slots}
      staff={staff}
    />
  );
}
