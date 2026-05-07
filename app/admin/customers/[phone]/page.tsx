import Link from "next/link";
import { redirect } from "next/navigation";
import {
  getAddonsAdmin,
  getAllSlots,
  getCustomerHistory,
  getDrinksAdmin,
  getServicesAdmin,
} from "@/lib/db/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { bookingTotals } from "@/lib/pricing";
import { formatDateLong, formatTime } from "@/lib/format";
import { CustomerProfileActions } from "./CustomerProfileActions";

export const dynamic = "force-dynamic";

async function getCustomerRow(phone: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("customers")
    .select("phone,is_vip,notes")
    .eq("phone", phone)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export default async function CustomerDetailPage({
  params,
}: {
  params: { phone: string };
}) {
  const phone = decodeURIComponent(params.phone);

  const [bookings, services, addons, drinks, slots, customer] = await Promise.all([
    getCustomerHistory(phone),
    getServicesAdmin(),
    getAddonsAdmin(),
    getDrinksAdmin(),
    getAllSlots(),
    getCustomerRow(phone),
  ]);

  if (bookings.length === 0 && !customer) {
    redirect("/admin/customers");
  }

  const slotById = new Map(slots.map((s) => [s.id, s]));
  const serviceById = new Map(services.map((s) => [s.id, s]));

  const displayName = bookings[0]?.customerName || phone;
  const isVip = customer?.is_vip ?? false;
  const notes = customer?.notes ?? null;

  const done = bookings.filter((b) => b.status === "done");
  const cancelled = bookings.filter((b) => b.status === "cancelled");
  const pending = bookings.filter((b) => b.status === "pending");
  const totalSpent = done.reduce(
    (sum, b) => sum + bookingTotals(b, services, addons, drinks).priceKwd,
    0
  );

  return (
    <div>
      <Link
        href="/admin/customers"
        className="text-sm text-brand-blue font-semibold mb-3 inline-block"
      >
        ‹ All customers
      </Link>

      <div className="card mb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-extrabold text-brand-blue truncate">
                {displayName}
              </h1>
              {isVip && (
                <span className="chip bg-brand-yellow text-brand-blue gap-1 px-2 py-0.5">
                  ⭐ VIP
                </span>
              )}
            </div>
            <a
              href={`tel:${phone}`}
              className="text-sm font-semibold text-brand-blue underline-offset-2 hover:underline"
            >
              {phone}
            </a>
          </div>
        </div>

        <dl className="grid grid-cols-4 gap-2 mt-4 text-center">
          <Stat label="Total" value={bookings.length} />
          <Stat label="Done" value={done.length} accent="green" />
          <Stat label="No-show" value={cancelled.length} accent="orange" />
          <Stat label="Spent" value={`${totalSpent} KWD`} accent="yellow" />
        </dl>
      </div>

      <CustomerProfileActions
        phone={phone}
        isVip={isVip}
        initialNotes={notes ?? ""}
      />

      <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 mt-6">
        Booking history
      </h2>

      {bookings.length === 0 ? (
        <div className="card text-sm text-gray-600 text-center py-6">
          No bookings yet.
        </div>
      ) : (
        <ul className="space-y-2">
          {pending.length > 0 &&
            pending.map((b) => {
              const slot = slotById.get(b.slotId);
              const svc = serviceById.get(b.serviceId);
              const total = bookingTotals(b, services, addons, drinks);
              return (
                <BookingHistoryRow
                  key={b.id}
                  bookingId={b.id}
                  status="pending"
                  serviceName={svc?.name ?? "—"}
                  whenLabel={
                    slot
                      ? `${formatDateLong(slot.date)} · ${formatTime(slot.time)}`
                      : "—"
                  }
                  totalKwd={total.priceKwd}
                  ref={b.ref}
                />
              );
            })}
          {done.map((b) => {
            const slot = slotById.get(b.slotId);
            const svc = serviceById.get(b.serviceId);
            const total = bookingTotals(b, services, addons, drinks);
            return (
              <BookingHistoryRow
                key={b.id}
                bookingId={b.id}
                status="done"
                serviceName={svc?.name ?? "—"}
                whenLabel={
                  slot
                    ? `${formatDateLong(slot.date)} · ${formatTime(slot.time)}`
                    : "—"
                }
                totalKwd={total.priceKwd}
                ref={b.ref}
              />
            );
          })}
          {cancelled.map((b) => {
            const slot = slotById.get(b.slotId);
            const svc = serviceById.get(b.serviceId);
            return (
              <BookingHistoryRow
                key={b.id}
                bookingId={b.id}
                status="cancelled"
                serviceName={svc?.name ?? "—"}
                whenLabel={
                  slot
                    ? `${formatDateLong(slot.date)} · ${formatTime(slot.time)}`
                    : "—"
                }
                ref={b.ref}
                noShow={b.cancellationReason === "no_show"}
              />
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: "green" | "yellow" | "orange";
}) {
  const cls =
    accent === "green"
      ? "text-green-700"
      : accent === "yellow"
      ? "text-brand-blue"
      : accent === "orange"
      ? "text-orange-700"
      : "text-brand-blue";
  return (
    <div className="bg-gray-50 rounded-lg py-1.5">
      <p className={`text-sm font-extrabold leading-none ${cls}`}>{value}</p>
      <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">
        {label}
      </p>
    </div>
  );
}

function BookingHistoryRow({
  bookingId,
  status,
  serviceName,
  whenLabel,
  totalKwd,
  ref,
  noShow,
}: {
  bookingId: string;
  status: "pending" | "done" | "cancelled";
  serviceName: string;
  whenLabel: string;
  totalKwd?: number;
  ref: string;
  noShow?: boolean;
}) {
  const stripe =
    status === "pending"
      ? "border-brand-yellow/60 bg-amber-50/40"
      : status === "done"
      ? "border-green-300 bg-green-50/40"
      : noShow
      ? "border-orange-300 bg-orange-50/40"
      : "border-gray-200 bg-gray-50/40";
  return (
    <li>
      <Link
        href={`/admin/bookings/${bookingId}`}
        className={`block rounded-xl border-2 px-3 py-2.5 ${stripe}`}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold truncate">{serviceName}</p>
          {totalKwd != null ? (
            <span className="text-xs font-bold text-brand-blue">
              {totalKwd} KWD
            </span>
          ) : (
            <span
              className={`chip text-[10px] px-2 py-0.5 ${
                noShow
                  ? "bg-orange-100 text-orange-800"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {noShow ? "No-show" : "Cancelled"}
            </span>
          )}
        </div>
        <p className="text-[11px] text-gray-600">{whenLabel}</p>
        <p className="text-[10px] font-mono text-gray-400 mt-0.5">{ref}</p>
      </Link>
    </li>
  );
}
