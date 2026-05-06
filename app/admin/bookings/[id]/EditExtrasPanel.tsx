"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateBookingExtrasAction } from "@/app/admin/actions";
import { bookingTotals } from "@/lib/pricing";
import type {
  Addon,
  Booking,
  Drink,
  DrinkOrder,
  Service,
} from "@/lib/types";

export function EditExtrasPanel({
  booking,
  services,
  addons,
  drinks,
}: {
  booking: Booking;
  services: Service[];
  addons: Addon[];
  drinks: Drink[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [serviceId, setServiceId] = useState(booking.serviceId);
  const [addonIds, setAddonIds] = useState<string[]>(booking.addonIds ?? []);
  const [drinkOrders, setDrinkOrders] = useState<DrinkOrder[]>(
    booking.drinkOrders ?? []
  );
  const [error, setError] = useState<string | null>(null);

  if (booking.status === "cancelled") return null;

  const original = bookingTotals(booking, services, addons, drinks);
  const current = bookingTotals(
    { serviceId, addonIds, drinkOrders },
    services,
    addons,
    drinks
  );

  const sortedOriginalAddons = [...(booking.addonIds ?? [])].sort().join(",");
  const sortedCurrentAddons = [...addonIds].sort().join(",");
  const drinkKey = (orders: DrinkOrder[]) =>
    [...orders]
      .filter((o) => o.qty > 0)
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((o) => `${o.id}:${o.qty}`)
      .join(",");
  const dirty =
    serviceId !== booking.serviceId ||
    sortedCurrentAddons !== sortedOriginalAddons ||
    drinkKey(drinkOrders) !== drinkKey(booking.drinkOrders ?? []);

  const delta = current.priceKwd - original.priceKwd;
  const wasOnlinePaid =
    booking.paymentMethod !== "cash" && booking.paymentStatus === "paid";

  function toggleAddon(id: string) {
    setAddonIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function setDrinkQty(id: string, qty: number) {
    const next = Math.max(0, Math.min(9, qty));
    setDrinkOrders((prev) => {
      const without = prev.filter((d) => d.id !== id);
      return next === 0 ? without : [...without, { id, qty: next }];
    });
  }

  function getDrinkQty(id: string) {
    return drinkOrders.find((d) => d.id === id)?.qty ?? 0;
  }

  function save() {
    setError(null);
    startTransition(async () => {
      try {
        await updateBookingExtrasAction(booking.id, {
          serviceId,
          addonIds,
          drinkOrders,
        });
        router.refresh();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to save changes");
      }
    });
  }

  const hot = drinks.filter((d) => d.temperature === "hot");
  const cold = drinks.filter((d) => d.temperature === "cold");

  return (
    <section className="card mt-5">
      <h2 className="text-sm font-bold uppercase tracking-wider text-brand-blue">
        Modify booking
      </h2>
      <p className="text-xs text-gray-500 mt-0.5 mb-4">
        Change the service, toggle add-ons, or add drinks after the customer arrives.
      </p>

      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
        Service
      </label>
      <select
        className="input mb-4"
        value={serviceId}
        onChange={(e) => setServiceId(e.target.value)}
        disabled={pending}
      >
        {services.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name} · {s.priceKwd} KWD · {s.durationMin}m
            {s.tier && s.tier !== "standard" ? ` (${s.tier})` : ""}
          </option>
        ))}
      </select>

      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
        Add-ons
      </label>
      <ul className="space-y-2">
        {addons.map((a) => {
          const checked = addonIds.includes(a.id);
          return (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => toggleAddon(a.id)}
                disabled={pending}
                aria-pressed={checked}
                className={`w-full text-left rounded-xl border px-3 py-2 flex items-center gap-3 transition ${
                  checked
                    ? "border-brand-blue bg-brand-blue/[0.04]"
                    : "border-gray-200"
                }`}
              >
                <span
                  className={`h-5 w-5 shrink-0 rounded border-2 flex items-center justify-center ${
                    checked
                      ? "bg-brand-blue border-brand-blue text-white"
                      : "border-gray-300"
                  }`}
                >
                  {checked && (
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3}
                      className="h-3 w-3"
                      aria-hidden
                    >
                      <polyline points="3 9 7 12 13 4" />
                    </svg>
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-tight">
                    {a.name}
                  </p>
                  {a.description && (
                    <p className="text-[11px] text-gray-500 leading-tight">
                      {a.description}
                    </p>
                  )}
                </div>
                <p className="text-xs font-bold text-brand-blue whitespace-nowrap">
                  +{a.priceKwd} KWD
                </p>
              </button>
            </li>
          );
        })}
      </ul>

      {drinks.length > 0 && (
        <>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 mt-5">
            Drinks
          </label>
          {hot.length > 0 && (
            <DrinkAdminGroup
              label="Hot"
              accent="bg-orange-100 text-orange-700"
              items={hot}
              getQty={getDrinkQty}
              setQty={setDrinkQty}
              disabled={pending}
            />
          )}
          {cold.length > 0 && (
            <DrinkAdminGroup
              label="Cold"
              accent="bg-sky-100 text-sky-700"
              items={cold}
              getQty={getDrinkQty}
              setQty={setDrinkQty}
              disabled={pending}
            />
          )}
        </>
      )}

      <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-sm space-y-1">
        <div className="flex justify-between text-gray-500">
          <span>Original total</span>
          <span className="font-semibold text-gray-700">
            {original.priceKwd} KWD · {original.durationMin}m
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">New total</span>
          <span className="font-extrabold text-brand-blue">
            {current.priceKwd} KWD · {current.durationMin}m
          </span>
        </div>
        {dirty && delta !== 0 && (
          <div
            className={`flex justify-between text-xs pt-1 border-t border-gray-200 mt-2 ${
              delta > 0 ? "text-orange-700" : "text-green-700"
            }`}
          >
            <span className="font-semibold">
              {delta > 0 ? "Difference to collect" : "Refund owed"}
            </span>
            <span className="font-bold">
              {delta > 0 ? "+" : ""}
              {delta} KWD
            </span>
          </div>
        )}
        {dirty && wasOnlinePaid && delta > 0 && (
          <p className="text-[11px] text-orange-700 mt-2 leading-snug">
            Customer already paid {original.priceKwd} KWD online — collect{" "}
            <span className="font-bold">{delta} KWD</span> in cash on site for
            the extras.
          </p>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 font-semibold mt-3">{error}</p>
      )}

      <button
        onClick={save}
        disabled={!dirty || pending}
        className="btn-primary w-full mt-4"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </section>
  );
}

function DrinkAdminGroup({
  label,
  accent,
  items,
  getQty,
  setQty,
  disabled,
}: {
  label: string;
  accent: string;
  items: Drink[];
  getQty: (id: string) => number;
  setQty: (id: string, qty: number) => void;
  disabled: boolean;
}) {
  return (
    <div className="mb-3">
      <p
        className={`chip ${accent} mb-2 text-[10px] uppercase tracking-wider`}
      >
        {label}
      </p>
      <ul className="space-y-2">
        {items.map((d) => {
          const qty = getQty(d.id);
          return (
            <li
              key={d.id}
              className={`rounded-xl border px-3 py-2 flex items-center gap-3 ${
                qty > 0
                  ? "border-brand-blue bg-brand-blue/[0.04]"
                  : "border-gray-200"
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-tight">{d.name}</p>
                <p className="text-xs font-bold text-brand-blue mt-0.5">
                  {d.priceKwd === 0 ? "Free" : `${d.priceKwd} KWD`}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setQty(d.id, qty - 1)}
                  disabled={disabled || qty === 0}
                  aria-label="Decrease"
                  className="h-8 w-8 rounded-full bg-gray-100 text-brand-blue font-bold text-lg leading-none flex items-center justify-center disabled:opacity-40"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm font-bold tabular-nums">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty(d.id, qty + 1)}
                  disabled={disabled}
                  aria-label="Increase"
                  className="h-8 w-8 rounded-full bg-brand-blue text-white font-bold text-lg leading-none flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
