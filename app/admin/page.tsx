import Link from "next/link";
import { BookingRow } from "@/components/BookingRow";
import { EmptyState } from "@/components/EmptyState";
import {
  getAllBookings,
  getAllSlots,
  getServicesAdmin,
} from "@/lib/db/admin";
import { todayKey } from "@/lib/seed";
import { formatDateLong, formatTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [bookings, services, slots] = await Promise.all([
    getAllBookings(),
    getServicesAdmin(),
    getAllSlots(),
  ]);

  const today = todayKey();
  const slotById = new Map(slots.map((s) => [s.id, s]));
  const serviceById = new Map(services.map((s) => [s.id, s]));

  const todays = bookings
    .filter((b) => {
      const slot = slotById.get(b.slotId);
      return slot?.date === today && b.status !== "cancelled";
    })
    .sort((a, b) => {
      const sa = slotById.get(a.slotId)?.time ?? "";
      const sb = slotById.get(b.slotId)?.time ?? "";
      return sa.localeCompare(sb);
    });

  const pending = todays.filter((b) => b.status === "pending").length;
  const done = todays.filter((b) => b.status === "done").length;

  // Notifications: pending today, unpaid cash bookings, recent no-shows.
  const unpaidCash = bookings.filter(
    (b) =>
      b.status !== "cancelled" &&
      b.paymentMethod === "cash" &&
      b.paymentStatus === "unpaid"
  ).length;

  const last7Iso = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().slice(0, 10);
  })();
  const recentNoShows = bookings.filter((b) => {
    if (b.status !== "cancelled") return false;
    if (b.cancellationReason !== "no_show") return false;
    const slot = slotById.get(b.slotId);
    return slot && slot.date >= last7Iso;
  }).length;

  // Next 12 slots from today onward — open ones in green, booked in red.
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;
  const upcomingSlots = slots
    .filter((s) => s.date > today || (s.date === today && s.time >= currentTime))
    .slice(0, 12);

  return (
    <div>
      <h1 className="text-xl font-bold text-brand-blue mb-1">Today</h1>
      <p className="text-sm text-gray-500 mb-4">
        {new Date().toLocaleDateString(undefined, {
          weekday: "long",
          month: "short",
          day: "numeric",
        })}
      </p>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <Stat label="Total" value={todays.length} accent="blue" />
        <Stat label="Pending" value={pending} accent="yellow" />
        <Stat label="Done" value={done} accent="green" />
      </div>

      {/* PENDING ACTIONS */}
      {(pending > 0 || unpaidCash > 0 || recentNoShows > 0) && (
        <section className="mb-7">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            Needs your attention
          </h2>
          <ul className="space-y-2">
            {pending > 0 && (
              <NotifRow
                href="/admin/bookings"
                accent="yellow"
                title={`${pending} pending today`}
                hint="Bookings still to mark Done or Cancelled"
              />
            )}
            {unpaidCash > 0 && (
              <NotifRow
                href="/admin/bookings"
                accent="orange"
                title={`${unpaidCash} unpaid cash booking${
                  unpaidCash === 1 ? "" : "s"
                }`}
                hint="Mark as paid once collected on site"
              />
            )}
            {recentNoShows > 0 && (
              <NotifRow
                href="/admin/bookings"
                accent="red"
                title={`${recentNoShows} no-show${
                  recentNoShows === 1 ? "" : "s"
                } in the last 7 days`}
                hint="Auto-cancelled by the no-show sweep"
              />
            )}
          </ul>
        </section>
      )}

      {/* TODAY'S BOOKINGS */}
      <section className="mb-7">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
          Today's bookings
        </h2>
        {todays.length === 0 ? (
          <EmptyState
            title="No bookings today"
            hint="New bookings will show up here automatically."
          />
        ) : (
          <ul className="space-y-3">
            {todays.map((b) => (
              <li key={b.id}>
                <BookingRow
                  booking={b}
                  service={serviceById.get(b.serviceId)}
                  slot={slotById.get(b.slotId)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* UPCOMING SLOTS */}
      {upcomingSlots.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            Next slots
          </h2>
          <div className="card !p-3">
            <div className="flex items-center gap-3 text-[11px] text-gray-600 mb-3">
              <span className="inline-flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                Open
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                Booked
              </span>
            </div>
            <ul className="grid grid-cols-2 gap-2">
              {upcomingSlots.map((s) => {
                const open = s.isOpen;
                return (
                  <li
                    key={s.id}
                    className={`rounded-lg border-l-4 px-3 py-2 ${
                      open
                        ? "border-green-500 bg-green-50"
                        : "border-red-500 bg-red-50"
                    }`}
                  >
                    <p className="text-[10px] uppercase tracking-wider text-gray-600">
                      {formatDateLong(s.date)}
                    </p>
                    <p
                      className={`text-sm font-bold ${
                        open ? "text-green-800" : "text-red-700"
                      }`}
                    >
                      {formatTime(s.time)}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}

function NotifRow({
  href,
  accent,
  title,
  hint,
}: {
  href: string;
  accent: "yellow" | "orange" | "red";
  title: string;
  hint: string;
}) {
  const colors = {
    yellow: "bg-yellow-50 border-yellow-300 text-yellow-900",
    orange: "bg-orange-50 border-orange-300 text-orange-900",
    red: "bg-red-50 border-red-300 text-red-900",
  } as const;
  return (
    <li>
      <Link
        href={href}
        className={`block rounded-xl border-2 px-3 py-2.5 ${colors[accent]}`}
      >
        <p className="text-sm font-bold">{title}</p>
        <p className="text-[11px] opacity-80">{hint}</p>
      </Link>
    </li>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "blue" | "yellow" | "green";
}) {
  const colors = {
    blue: "bg-brand-blue text-white",
    yellow: "bg-brand-yellow text-brand-blue",
    green: "bg-green-100 text-green-800",
  } as const;
  return (
    <div className={`rounded-2xl p-4 ${colors[accent]}`}>
      <p className="text-2xl font-extrabold leading-none">{value}</p>
      <p className="text-xs uppercase tracking-wider mt-2 opacity-90">
        {label}
      </p>
    </div>
  );
}
