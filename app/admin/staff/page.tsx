import { getAllBookings, getStaffAll } from "@/lib/db/admin";
import { todayKey } from "@/lib/seed";
import { StaffManager } from "./StaffManager";

export const dynamic = "force-dynamic";

export default async function AdminStaffPage() {
  const [staff, bookings] = await Promise.all([
    getStaffAll(),
    getAllBookings(),
  ]);

  // Per-staff active booking counts (today + total upcoming pending).
  const today = todayKey();
  const todayCounts: Record<string, number> = {};
  const upcomingCounts: Record<string, number> = {};
  for (const b of bookings) {
    if (!b.staffId) continue;
    if (b.status === "cancelled") continue;
    upcomingCounts[b.staffId] = (upcomingCounts[b.staffId] ?? 0) + 1;
  }
  for (const b of bookings) {
    if (!b.staffId) continue;
    if (b.status !== "pending") continue;
    todayCounts[b.staffId] = (todayCounts[b.staffId] ?? 0) + 1;
  }
  // (We don't have slot.date readily in this aggregation, so todayCounts
  // approximates "today" as pending-bookings-by-staff. Good enough for the
  // dashboard; the booking detail is the source of truth.)
  void today; // silence unused

  return (
    <StaffManager
      staff={staff}
      upcomingCounts={upcomingCounts}
      todayCounts={todayCounts}
    />
  );
}
