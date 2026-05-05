"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { StatusChip } from "@/components/StatusChip";
import { PaymentBadge, methodLabel } from "@/components/PaymentBadge";
import { formatDateLong, formatTime } from "@/lib/format";
import { bookingTotals } from "@/lib/pricing";

export default function AdminBookingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const {
    getBooking,
    getService,
    getSlot,
    updateStatus,
    markPaid,
    services,
    addons,
  } = useStore();

  const booking = getBooking(params.id);

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

  const service = getService(booking.serviceId);
  const slot = getSlot(booking.slotId);
  const totals = bookingTotals(booking, services, addons);

  function markDone() {
    if (!booking) return;
    updateStatus(booking.id, "done");
  }
  function cancel() {
    if (!booking) return;
    if (confirm("Cancel this booking? The slot will reopen.")) {
      updateStatus(booking.id, "cancelled");
      router.push("/admin/bookings");
    }
  }

  return (
    <div>
      <Link
        href="/admin/bookings"
        className="text-sm text-brand-blue font-semibold mb-3 inline-block"
      >
        ‹ All bookings
      </Link>

      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-bold text-brand-blue">
            {booking.customerName}
          </h1>
          <StatusChip status={booking.status} />
        </div>
        <div className="mb-3">
          <PaymentBadge booking={booking} />
        </div>
        <p className="font-mono text-xs text-gray-400 mb-4">{booking.ref}</p>

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
          <Field label="Phone" value={booking.phone} />
          {booking.notes && <Field label="Notes" value={booking.notes} />}
          <Field
            label="Booked at"
            value={new Date(booking.createdAt).toLocaleString()}
          />
        </dl>
      </div>

      {booking.paymentMethod === "cash" &&
        booking.paymentStatus === "unpaid" &&
        booking.status !== "cancelled" && (
          <button
            onClick={() => markPaid(booking.id)}
            className="btn-primary w-full mt-4"
          >
            Mark cash as Paid
          </button>
        )}

      {booking.status === "pending" && (
        <div className="mt-5 flex gap-3">
          <button onClick={cancel} className="btn-outline flex-1">
            Cancel
          </button>
          <button onClick={markDone} className="btn-accent flex-1">
            Mark as Done
          </button>
        </div>
      )}

      {booking.status === "done" && (
        <p className="card mt-5 text-sm text-green-700 font-semibold text-center">
          This booking is complete.
        </p>
      )}
      {booking.status === "cancelled" && (
        <p className="card mt-5 text-sm text-gray-600 text-center">
          This booking was cancelled.
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
