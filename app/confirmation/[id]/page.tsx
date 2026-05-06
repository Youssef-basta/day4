import Link from "next/link";
import { BrandHeader } from "@/components/BrandHeader";
import { formatDateLong, formatTime } from "@/lib/format";
import { bookingTotals } from "@/lib/pricing";
import { methodLabel } from "@/components/PaymentBadge";
import { getBookingById } from "@/lib/db/admin";
import { getServicesAdmin, getAddonsAdmin } from "@/lib/db/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapSlot } from "@/lib/db/map";

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

export default async function ConfirmationPage({
  params,
}: {
  params: { id: string };
}) {
  const booking = await getBookingById(params.id);

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

  const [services, addons, slot] = await Promise.all([
    getServicesAdmin(),
    getAddonsAdmin(),
    getSlotById(booking.slotId),
  ]);
  const service = services.find((s) => s.id === booking.serviceId);
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
            You&apos;re booked!
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            We&apos;ll see you soon, {booking.customerName.split(" ")[0]}.
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
            What&apos;s next
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
          <p className="text-[11px] text-gray-500 mt-3 leading-snug">
            Heads up: your slot is held for 30 minutes after the start time.
            After that it's automatically released so other customers can book it.
          </p>
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
