import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandHeader } from "@/components/BrandHeader";
import { CustomerHeaderActions } from "@/components/CustomerHeaderActions";
import { getStudioSettings } from "@/lib/db/catalog";
import {
  getAddonsAdmin,
  getAllSlots,
  getCustomerHistory,
  getDrinksAdmin,
  getServicesAdmin,
} from "@/lib/db/admin";
import { getCustomerSession } from "@/lib/db/customer";
import { bookingTotals } from "@/lib/pricing";
import { formatDateLong, formatTime } from "@/lib/format";
import { todayKey } from "@/lib/seed";

export const dynamic = "force-dynamic";

export default async function MyBookingsPage() {
  const session = await getCustomerSession();
  if (!session) redirect("/login");

  const [settings, history, services, addons, drinks, slots] =
    await Promise.all([
      getStudioSettings(),
      getCustomerHistory(session.phone),
      getServicesAdmin(),
      getAddonsAdmin(),
      getDrinksAdmin(),
      getAllSlots(),
    ]);

  const slotById = new Map(slots.map((s) => [s.id, s]));
  const serviceById = new Map(services.map((s) => [s.id, s]));
  const today = todayKey();

  const upcoming = history.filter((b) => {
    if (b.status !== "pending") return false;
    const slot = slotById.get(b.slotId);
    return slot && slot.date >= today;
  });
  const past = history.filter((b) => !upcoming.includes(b));

  return (
    <>
      <BrandHeader
        brandName={settings.brandName}
        rightSlot={<CustomerHeaderActions session={session} />}
      />
      <main className="mx-auto max-w-md px-4 py-6 pb-24 space-y-6">
        <Link
          href="/account"
          className="text-sm text-brand-blue font-semibold inline-block"
        >
          ‹ Back to account
        </Link>

        <div>
          <h1 className="text-xl font-bold text-brand-blue">Your bookings</h1>
          <p className="text-xs text-gray-500 mt-1">
            {history.length} total visit{history.length === 1 ? "" : "s"}
          </p>
        </div>

        {upcoming.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
              Upcoming
            </h2>
            <ul className="space-y-2">
              {upcoming.map((b) => {
                const slot = slotById.get(b.slotId);
                const svc = serviceById.get(b.serviceId);
                const total = bookingTotals(b, services, addons, drinks);
                return (
                  <li
                    key={b.id}
                    className="rounded-xl border-2 border-brand-yellow/60 bg-amber-50/40 px-3 py-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold">{svc?.name ?? "—"}</p>
                      <span className="chip bg-brand-yellow text-brand-blue px-2 py-0.5 text-[10px]">
                        Upcoming
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {slot
                        ? `${formatDateLong(slot.date)} · ${formatTime(slot.time)}`
                        : "—"}
                    </p>
                    <p className="text-xs font-bold text-brand-blue mt-1">
                      {total.priceKwd} KWD
                    </p>
                    <p className="text-[10px] font-mono text-gray-400 mt-0.5">
                      {b.ref}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            Past
          </h2>
          {past.length === 0 ? (
            <div className="card text-sm text-gray-600 text-center py-6">
              No past visits yet.{" "}
              <Link href="/book" className="text-brand-blue font-semibold">
                Book your first
              </Link>
              .
            </div>
          ) : (
            <ul className="space-y-2">
              {past.map((b) => {
                const slot = slotById.get(b.slotId);
                const svc = serviceById.get(b.serviceId);
                const total = bookingTotals(b, services, addons, drinks);
                const noShow =
                  b.status === "cancelled" &&
                  b.cancellationReason === "no_show";
                return (
                  <li key={b.id} className="card !py-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold truncate">
                        {svc?.name ?? "—"}
                      </p>
                      <span
                        className={`chip text-[10px] px-2 py-0.5 ${
                          b.status === "done"
                            ? "bg-green-100 text-green-800"
                            : noShow
                            ? "bg-orange-100 text-orange-800"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {b.status === "done"
                          ? "Done"
                          : noShow
                          ? "No-show"
                          : "Cancelled"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {slot
                        ? `${formatDateLong(slot.date)} · ${formatTime(slot.time)}`
                        : "—"}
                    </p>
                    <p className="text-xs font-bold text-brand-blue mt-1">
                      {total.priceKwd} KWD
                    </p>
                    <Link
                      href={`/book?service=${encodeURIComponent(b.serviceId)}`}
                      className="mt-2 inline-block text-xs font-bold text-brand-blue underline-offset-2 hover:underline"
                    >
                      ↻ Book again
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
