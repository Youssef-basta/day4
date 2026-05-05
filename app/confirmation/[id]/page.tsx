"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { BrandHeader } from "@/components/BrandHeader";
import { useStore } from "@/lib/store";
import { formatDateLong, formatTime } from "@/lib/format";
import { bookingTotals } from "@/lib/pricing";
import { methodLabel } from "@/components/PaymentBadge";

export default function ConfirmationPage() {
  const params = useParams<{ id: string }>();
  const { getBooking, getService, getSlot, services, addons } = useStore();

  const booking = getBooking(params.id);

  if (!booking) {
    return (
      <>
        <BrandHeader />
        <main className="mx-auto max-w-md px-4 py-10">
          <div className="card text-center">
            <p className="font-semibold text-gray-700">Booking not found</p>
            <p className="text-sm text-gray-500 mt-1">
              It may have been cleared. Try booking again.
            </p>
            <Link href="/" className="btn-primary mt-5 inline-flex">
              Back to home
            </Link>
          </div>
        </main>
      </>
    );
  }

  const service = getService(booking.serviceId);
  const slot = getSlot(booking.slotId);
  const totals = bookingTotals(booking, services, addons);

  return (
    <>
      <BrandHeader />
      <main className="mx-auto max-w-md px-4 py-6 pb-24">
        <div className="card text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-brand-yellow flex items-center justify-center text-brand-blue text-2xl font-black">
            ✓
          </div>
          <h1 className="text-xl font-bold text-brand-blue mt-3">
            You're booked!
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            We'll see you soon, {booking.customerName.split(" ")[0]}.
          </p>

          <div className="mt-5 rounded-xl bg-gray-50 px-4 py-4 text-left text-sm">
            <Row label="Reference" value={booking.ref} mono />
            <Row label="Service" value={service?.name ?? "—"} />
            {totals.addons.length > 0 && (
              <Row
                label="Add-ons"
                value={totals.addons.map((a) => a.name).join(", ")}
              />
            )}
            <Row
              label="Time"
              value={
                slot
                  ? `${formatDateLong(slot.date)} · ${formatTime(
                      slot.time
                    )} · ${totals.durationMin} min`
                  : "—"
              }
            />
            <Row label="Total" value={`${totals.priceKwd} KWD`} />
            <Row label="Phone" value={booking.phone} />
            <Row
              label="Payment"
              value={
                booking.paymentMethod === "cash"
                  ? `Cash on site · ${totals.priceKwd} KWD due`
                  : `${methodLabel(booking.paymentMethod)} · Paid${
                      booking.cardLast4 ? ` (•••• ${booking.cardLast4})` : ""
                    }`
              }
            />
            {booking.notes && <Row label="Notes" value={booking.notes} />}
          </div>
        </div>

        <section className="mt-6">
          <h2 className="text-sm font-bold text-brand-blue uppercase tracking-wider mb-2">
            What's next
          </h2>
          <ol className="card space-y-3 text-sm list-decimal list-inside">
            <li>Save your reference: <span className="font-semibold">{booking.ref}</span></li>
            <li>Arrive 5 minutes early at the studio.</li>
            <li>Show the reference at the counter.</li>
            {booking.paymentMethod === "cash" && (
              <li className="text-orange-700 font-semibold">
                Bring {totals.priceKwd} KWD in cash to pay on arrival.
              </li>
            )}
          </ol>
        </section>

        <div className="mt-6 flex gap-3">
          <Link href="/" className="btn-outline flex-1">
            Home
          </Link>
          <Link href="/book" className="btn-primary flex-1">
            Book another
          </Link>
        </div>
      </main>
    </>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b last:border-b-0 border-gray-200">
      <span className="text-gray-500">{label}</span>
      <span className={`font-semibold text-right ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}
