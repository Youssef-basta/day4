import {
  getAllBookings,
  getAllSlots,
  getAddonsAdmin,
  getDrinksAdmin,
  getServicesAdmin,
} from "@/lib/db/admin";
import { bookingTotals } from "@/lib/pricing";
import { todayKey } from "@/lib/seed";

export const dynamic = "force-dynamic";

function isoDateNDaysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export default async function AdminReportsPage() {
  const [bookings, services, addons, drinks, slots] = await Promise.all([
    getAllBookings(),
    getServicesAdmin(),
    getAddonsAdmin(),
    getDrinksAdmin(),
    getAllSlots(),
  ]);

  const slotById = new Map(slots.map((s) => [s.id, s]));
  const serviceById = new Map(services.map((s) => [s.id, s]));

  const today = todayKey();
  const last7 = isoDateNDaysAgo(6); // inclusive of today
  const last30 = isoDateNDaysAgo(29);

  type Bucket = {
    bookings: number;
    done: number;
    cancelled: number;
    revenueKwd: number;
  };
  const empty = (): Bucket => ({
    bookings: 0,
    done: 0,
    cancelled: 0,
    revenueKwd: 0,
  });

  const todayB = empty();
  const weekB = empty();
  const monthB = empty();

  const serviceCount: Record<string, number> = {};
  const hourCount: number[] = Array(24).fill(0);

  for (const b of bookings) {
    const slot = slotById.get(b.slotId);
    if (!slot) continue;
    const t = bookingTotals(b, services, addons, drinks);

    const inRange = (since: string) => slot.date >= since;

    if (inRange(today)) {
      todayB.bookings += 1;
      if (b.status === "done") {
        todayB.done += 1;
        todayB.revenueKwd += t.priceKwd;
      }
      if (b.status === "cancelled") todayB.cancelled += 1;
    }
    if (inRange(last7)) {
      weekB.bookings += 1;
      if (b.status === "done") {
        weekB.done += 1;
        weekB.revenueKwd += t.priceKwd;
      }
      if (b.status === "cancelled") weekB.cancelled += 1;
    }
    if (inRange(last30)) {
      monthB.bookings += 1;
      if (b.status === "done") {
        monthB.done += 1;
        monthB.revenueKwd += t.priceKwd;
      }
      if (b.status === "cancelled") monthB.cancelled += 1;
      if (b.status !== "cancelled") {
        serviceCount[b.serviceId] = (serviceCount[b.serviceId] ?? 0) + 1;
      }
      const hour = parseInt(slot.time.slice(0, 2), 10);
      if (!Number.isNaN(hour) && b.status !== "cancelled") {
        hourCount[hour] += 1;
      }
    }
  }

  const topServices = Object.entries(serviceCount)
    .map(([id, count]) => ({
      id,
      count,
      service: serviceById.get(id),
    }))
    .filter((s) => s.service)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topServiceMax = topServices[0]?.count ?? 1;
  const hoursMax = Math.max(...hourCount, 1);

  // Active hours (10–21 covers studio open hours)
  const activeHours = Array.from({ length: 12 }, (_, i) => 10 + i);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-brand-blue">Reports</h1>
        <p className="text-xs text-gray-500 mt-1">
          Bookings, revenue, and demand patterns. Revenue counts only{" "}
          <span className="font-semibold">Done</span> bookings.
        </p>
      </div>

      <section>
        <SectionHeader>At a glance</SectionHeader>
        <div className="grid grid-cols-3 gap-2">
          <RangeCard label="Today" b={todayB} />
          <RangeCard label="Last 7 days" b={weekB} />
          <RangeCard label="Last 30 days" b={monthB} />
        </div>
      </section>

      <section>
        <SectionHeader>Top services (last 30 days)</SectionHeader>
        {topServices.length === 0 ? (
          <p className="card text-sm text-gray-600">No bookings yet.</p>
        ) : (
          <div className="card space-y-3">
            {topServices.map((s, i) => (
              <div key={s.id}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-semibold">
                    {i + 1}. {s.service?.name ?? s.id}
                  </span>
                  <span className="font-mono text-xs text-gray-500">
                    {s.count}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-brand-blue"
                    style={{
                      width: `${Math.round((s.count / topServiceMax) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeader>Busiest hours (last 30 days)</SectionHeader>
        <div className="card">
          <div className="flex items-end gap-1 h-32">
            {activeHours.map((h) => {
              const count = hourCount[h];
              const height = Math.round((count / hoursMax) * 100);
              const isPeak = count === hoursMax && count > 0;
              return (
                <div
                  key={h}
                  className="flex-1 flex flex-col items-center gap-1"
                  title={`${h}:00 — ${count} booking${count === 1 ? "" : "s"}`}
                >
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className={`w-full rounded-t-md ${
                        isPeak ? "bg-brand-yellow" : "bg-brand-blue"
                      } ${count === 0 ? "opacity-20" : ""}`}
                      style={{
                        height: `${Math.max(height, 4)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-1 mt-1">
            {activeHours.map((h) => (
              <div
                key={h}
                className="flex-1 text-center text-[9px] text-gray-500 font-mono"
              >
                {h}
              </div>
            ))}
          </div>
          <p className="text-[11px] text-gray-500 mt-3 text-center">
            Hours of the day · yellow = peak
          </p>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
      {children}
    </h2>
  );
}

function RangeCard({
  label,
  b,
}: {
  label: string;
  b: { bookings: number; done: number; cancelled: number; revenueKwd: number };
}) {
  return (
    <div className="card !p-3">
      <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
        {label}
      </p>
      <p className="text-2xl font-extrabold text-brand-blue mt-1 leading-none">
        {b.bookings}
      </p>
      <p className="text-[10px] text-gray-500 mt-0.5">bookings</p>
      <p className="mt-2 text-sm font-bold text-brand-blue">
        {b.revenueKwd} <span className="text-[10px] text-gray-500">KWD</span>
      </p>
      <p className="text-[10px] text-gray-500">revenue</p>
      <div className="flex justify-between mt-2 text-[10px]">
        <span className="text-green-700 font-semibold">{b.done} done</span>
        <span className="text-red-600 font-semibold">{b.cancelled} ×</span>
      </div>
    </div>
  );
}
