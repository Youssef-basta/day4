import Link from "next/link";
import { BrandHeader } from "@/components/BrandHeader";
import { formatDateLong, formatTime } from "@/lib/format";
import { bookingTotals } from "@/lib/pricing";
import { methodLabel } from "@/components/PaymentBadge";
import { getBookingById } from "@/lib/db/admin";
import {
  getServicesAdmin,
  getAddonsAdmin,
  getDrinksAdmin,
} from "@/lib/db/admin";
import { getStudioSettings } from "@/lib/db/catalog";
import { useServerT } from "@/lib/i18n-server";
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

  const settings = await getStudioSettings();
  const { t } = useServerT();

  if (!booking) {
    return (
      <>
        <BrandHeader brandName={settings.brandName} />
        <main className="mx-auto max-w-md px-4 py-10">
          <div className="card text-center">
            <p className="font-semibold text-gray-700">{t("conf.notFound")}</p>
            <p className="text-sm text-gray-500 mt-1">
              {t("conf.notFoundHint")}
            </p>
            <Link href="/" className="btn-primary mt-5 inline-flex">
              {t("conf.backHome")}
            </Link>
          </div>
        </main>
      </>
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
    <>
      <BrandHeader brandName={settings.brandName} />
      <main className="mx-auto max-w-md px-4 py-6 pb-24">
        <div className="card text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-brand-yellow flex items-center justify-center text-brand-blue text-2xl font-black">
            ✓
          </div>
          <h1 className="text-xl font-bold text-brand-blue mt-3">
            {t("conf.youreBooked")}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {t("conf.seeSoon", {
              name: booking.customerName.split(" ")[0] || booking.customerName,
            })}
          </p>

          <div className="mt-5 rounded-2xl bg-brand-blue text-white px-4 py-4">
            <p className="text-[10px] uppercase tracking-[0.25em] text-brand-yellow font-semibold">
              {t("conf.bookingId")}
            </p>
            <p className="font-mono font-extrabold text-2xl mt-1 tracking-wider">
              {booking.ref}
            </p>
          </div>

          <div className="mt-3 rounded-xl bg-gray-50 px-4 py-4 text-left text-sm">
            <Row label={t("conf.serviceLabel")} value={service?.name ?? "—"} />
            {totals.addons.length > 0 && (
              <Row
                label={t("conf.addonsLabel")}
                value={totals.addons.map((a) => a.name).join(", ")}
              />
            )}
            {totals.drinks.length > 0 && (
              <Row
                label={t("conf.drinksLabel")}
                value={totals.drinks
                  .map((l) => `${l.qty}× ${l.drink.name}`)
                  .join(", ")}
              />
            )}
            <Row
              label={t("conf.timeLabel")}
              value={
                slot
                  ? `${formatDateLong(slot.date)} · ${formatTime(
                      slot.time
                    )} · ${totals.durationMin} min`
                  : "—"
              }
            />
            <Row label={t("conf.totalLabel")} value={`${totals.priceKwd} KWD`} />
            <Row label={t("conf.phoneLabel")} value={booking.phone} />
            <Row
              label={t("conf.paymentLabel")}
              value={
                booking.paymentMethod === "cash"
                  ? t("conf.cashSummary", { n: totals.priceKwd })
                  : `${methodLabel(booking.paymentMethod)} · Paid${
                      booking.cardLast4 ? ` (•••• ${booking.cardLast4})` : ""
                    }`
              }
            />
            {booking.notes && <Row label={t("conf.notesLabel")} value={booking.notes} />}
          </div>
        </div>

        <section className="mt-6">
          <h2 className="text-sm font-bold text-brand-blue uppercase tracking-wider mb-2">
            {t("conf.whatsNext")}
          </h2>
          <ol className="card space-y-3 text-sm list-decimal list-inside">
            <li>
              {t("conf.saveRef", { ref: "" })}
              <span className="font-semibold">{booking.ref}</span>
            </li>
            <li>{t("conf.arriveEarly")}</li>
            <li>{t("conf.showRef")}</li>
            {booking.paymentMethod === "cash" && (
              <li className="text-orange-700 font-semibold">
                {t("conf.bringCash", { n: totals.priceKwd })}
              </li>
            )}
          </ol>
          <p className="text-[11px] text-gray-500 mt-3 leading-snug">
            {t("conf.holdNote", { min: settings.graceMin })}
          </p>
        </section>

        <div className="mt-6 flex gap-3">
          <Link href="/" className="btn-outline flex-1">
            {t("conf.home")}
          </Link>
          <Link href="/book" className="btn-primary flex-1">
            {t("conf.bookAnother")}
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
