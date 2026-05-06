import Link from "next/link";
import { StatusChip } from "@/components/StatusChip";
import { PaymentBadge, methodLabel } from "@/components/PaymentBadge";
import { formatDateLong, formatTime } from "@/lib/format";
import { bookingTotals } from "@/lib/pricing";
import {
  getAddonsAdmin,
  getBookingById,
  getDrinksAdmin,
  getServicesAdmin,
} from "@/lib/db/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapSlot } from "@/lib/db/map";
import { BookingActions } from "./BookingActions";
import { EditExtrasPanel } from "./EditExtrasPanel";

export const dynamic = "force-dynamic";

async function getSlotById(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("slots")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapSlot(data) : null;
}

export default async function AdminBookingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const booking = await getBookingById(params.id);

  if (!booking) {
    return (
      <div className="card text-center">
        <p className="font-semibold text-gray-700">Booking not found</p>
        <Link href="/admin/bookings" className="btn-primary mt-5 inline-flex">
          Back to bookings
        </Link>
      </div>
    );
  }

  const [services, addons, drinks, slot] = await Promise.all([
    getServicesAdmin(),
    getAddonsAdmin(),
    getDrinksAdmin(),
    getSlotById(booking.slotId),
  ]);
  const service = services.find((s) => s.id === booking.serviceId);
  const totals = bookingTotals(booking, services, addons, drinks);

  return (
    <div>
      <Link
        href="/admin/bookings"
        className="text-sm text-brand-blue font-semibold mb-3 inline-block"
      >
        ‹ All bookings
      </Link>

      <div className="card">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h1 className="text-xl font-extrabold text-brand-blue truncate">
              {booking.customerName}
            </h1>
            <a
              href={`tel:${booking.phone}`}
              className="text-sm font-semibold text-brand-blue underline-offset-2 hover:underline"
            >
              {booking.phone}
            </a>
          </div>
          <StatusChip
            status={booking.status}
            reason={booking.cancellationReason}
          />
        </div>
        <div className="mb-3 flex items-center gap-2">
          <PaymentBadge booking={booking} />
          <span className="font-mono text-[11px] text-gray-400">
            {booking.ref}
          </span>
        </div>

        <dl className="space-y-2 text-sm">
          <Field label="Service" value={service?.name ?? "—"} />
          {totals.addons.length > 0 && (
            <Field
              label="Add-ons"
              value={totals.addons
                .map((a) => `${a.name} (+${a.priceKwd})`)
                .join(", ")}
            />
          )}
          {totals.drinks.length > 0 && (
            <Field
              label="Drinks"
              value={totals.drinks
                .map((l) => `${l.qty}× ${l.drink.name}`)
                .join(", ")}
            />
          )}
          <Field
            label="When"
            value={
              slot
                ? `${formatDateLong(slot.date)} · ${formatTime(
                    slot.time
                  )} · ${totals.durationMin} min`
                : "—"
            }
          />
          <Field label="Total" value={`${totals.priceKwd} KWD`} />
          <Field
            label="Payment"
            value={
              booking.paymentMethod === "cash"
                ? `Cash on site (${
                    booking.paymentStatus === "paid" ? "paid" : "unpaid"
                  })`
                : `${methodLabel(booking.paymentMethod)}${
                    booking.cardLast4 ? ` •••• ${booking.cardLast4}` : ""
                  } (paid)`
            }
          />
          {booking.notes && <Field label="Notes" value={booking.notes} />}
          <Field
            label="Booked at"
            value={new Date(booking.createdAt).toLocaleString()}
          />
        </dl>
      </div>

      <BookingActions booking={booking} />

      <EditExtrasPanel
        booking={booking}
        services={services}
        addons={addons}
        drinks={drinks}
      />

      {booking.status === "done" && (
        <p className="card mt-5 text-sm text-green-700 font-semibold text-center">
          This booking is complete.
        </p>
      )}
      {booking.status === "cancelled" && (
        <p
          className={`card mt-5 text-sm text-center ${
            booking.cancellationReason === "no_show"
              ? "text-orange-700"
              : "text-gray-600"
          }`}
        >
          {booking.cancellationReason === "no_show"
            ? "Auto-cancelled — customer did not arrive within 30 minutes."
            : "This booking was cancelled."}
        </p>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b last:border-b-0 border-gray-100">
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-semibold text-right">{value}</dd>
    </div>
  );
}
