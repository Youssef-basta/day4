import {
  getAllBookings,
  getAllSlots,
  getServicesAdmin,
} from "@/lib/db/admin";
import { BookingsList } from "./BookingsList";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const [bookings, services, slots] = await Promise.all([
    getAllBookings(),
    getServicesAdmin(),
    getAllSlots(),
  ]);
  return <BookingsList bookings={bookings} services={services} slots={slots} />;
}
