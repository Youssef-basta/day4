"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { adminCreateBookingAction } from "@/app/admin/actions";
import { bookingTotals } from "@/lib/pricing";
import { formatDateLong, formatTime } from "@/lib/format";
import type {
  Addon,
  Drink,
  DrinkOrder,
  PaymentMethod,
  Service,
  Slot,
  Staff,
} from "@/lib/types";

export function NewBookingForm({
  services,
  addons,
  drinks,
  slots,
  staff,
}: {
  services: Service[];
  addons: Addon[];
  drinks: Drink[];
  slots: Slot[];
  staff: Staff[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Default to first active service (typically Classic Haircut)
  const defaultServiceId =
    services.find((s) => s.isActive ?? true)?.id ?? services[0]?.id ?? "";

  const [serviceId, setServiceId] = useState(defaultServiceId);
  const [slotId, setSlotId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [markPaid, setMarkPaid] = useState(true);
  const [staffId, setStaffId] = useState<string>(staff[0]?.id ?? "");
  const [notes, setNotes] = useState("");
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [drinkOrders, setDrinkOrders] = useState<DrinkOrder[]>([]);
  const [showExtras, setShowExtras] = useState(false);

  const openSlots = useMemo(() => slots.filter((s) => s.isOpen), [slots]);

  const totals = serviceId
    ? bookingTotals({ serviceId, addonIds, drinkOrders }, services, addons, drinks)
    : { priceKwd: 0, durationMin: 0, addons: [], drinks: [], service: undefined };

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

  function submit() {
    setError(null);
    const phoneDigits = phone.replace(/\D/g, "");
    if (!name.trim()) return setError("Customer name is required.");
    if (phoneDigits.length !== 8)
      return setError("Phone must be 8 digits.");
    if (!serviceId) return setError("Pick a service.");
    if (!slotId) return setError("Pick a time slot.");

    startTransition(async () => {
      try {
        await adminCreateBookingAction({
          customerName: name.trim(),
          phone: phoneDigits,
          serviceId,
          addonIds,
          drinkOrders,
          slotId,
          notes: notes.trim() || undefined,
          paymentMethod,
          markPaid: paymentMethod === "cash" ? markPaid : true,
          staffId: staffId || undefined,
        });
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Could not create booking");
      }
    });
  }

  return (
    <div>
      <Link
        href="/admin/bookings"
        className="text-sm text-brand-blue font-semibold mb-3 inline-block"
      >
        ‹ All bookings
      </Link>

      <h1 className="text-xl font-bold text-brand-blue mb-1">
        New booking
      </h1>
      <p className="text-xs text-gray-500 mb-5">
        Use this for walk-ins or phone bookings — the customer doesn't need
        to go through the public flow.
      </p>

      <div className="card space-y-4">
        <Field label="Customer name">
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ahmed Al-Sabah"
            autoFocus
          />
        </Field>

        <Field label="Phone (8 digits)">
          <div className="flex items-stretch rounded-xl border border-gray-300 focus-within:ring-2 focus-within:ring-brand-blue overflow-hidden">
            <span className="px-3 py-3 bg-gray-50 text-gray-600 text-sm font-semibold border-r border-gray-300 select-none">
              +965
            </span>
            <input
              className="flex-1 px-4 py-3 text-base focus:outline-none"
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 8))
              }
              maxLength={8}
              placeholder="50001234"
            />
          </div>
        </Field>

        <Field label="Service">
          <select
            className="input"
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} · {s.priceKwd} KWD · {s.durationMin}m
                {s.tier && s.tier !== "standard" ? ` (${s.tier})` : ""}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Slot" hint={`${openSlots.length} open in the next 14 days`}>
          <select
            className="input"
            value={slotId ?? ""}
            onChange={(e) => setSlotId(e.target.value || null)}
          >
            <option value="">— Pick a time —</option>
            {openSlots.map((s) => (
              <option key={s.id} value={s.id}>
                {formatDateLong(s.date)} · {formatTime(s.time)}
              </option>
            ))}
          </select>
        </Field>

        {staff.length > 0 && (
          <Field label="Assign barber">
            <select
              className="input"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
            >
              <option value="">— Unassigned —</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
        )}

        <Field label="Payment">
          <div className="grid grid-cols-3 gap-2">
            {(["cash", "knet", "visa"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setPaymentMethod(m)}
                className={`rounded-xl py-2 text-xs font-bold ${
                  paymentMethod === m
                    ? "bg-brand-blue text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {m === "cash" ? "Cash" : m === "knet" ? "KNET" : "Visa"}
              </button>
            ))}
          </div>
          {paymentMethod === "cash" && (
            <label className="flex items-center gap-2 text-xs mt-3 text-gray-700">
              <input
                type="checkbox"
                checked={markPaid}
                onChange={(e) => setMarkPaid(e.target.checked)}
                className="h-4 w-4"
              />
              Mark as paid (collect cash now)
            </label>
          )}
          {(paymentMethod === "knet" || paymentMethod === "visa") && (
            <p className="text-[11px] text-gray-500 mt-2 leading-snug">
              Card payments are recorded as paid (collected via the gateway
              outside of this form). To use the live gateway, have the
              customer book through the public site instead.
            </p>
          )}
        </Field>

        <button
          type="button"
          onClick={() => setShowExtras((v) => !v)}
          className="text-xs font-bold text-brand-blue text-left"
        >
          {showExtras ? "− Hide extras" : "+ Add-ons & drinks"}
        </button>

        {showExtras && (
          <>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Add-ons
              </p>
              <ul className="space-y-1.5">
                {addons.map((a) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => toggleAddon(a.id)}
                      className={`w-full text-left rounded-xl border px-3 py-2 flex items-center gap-3 text-sm ${
                        addonIds.includes(a.id)
                          ? "border-brand-blue bg-brand-blue/[0.04]"
                          : "border-gray-200"
                      }`}
                    >
                      <span
                        className={`h-4 w-4 shrink-0 rounded border-2 ${
                          addonIds.includes(a.id)
                            ? "bg-brand-blue border-brand-blue"
                            : "border-gray-300"
                        }`}
                      />
                      <span className="flex-1">{a.name}</span>
                      <span className="text-xs font-bold text-brand-blue">
                        +{a.priceKwd}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Drinks
              </p>
              <ul className="space-y-1.5">
                {drinks.map((d) => {
                  const qty = getDrinkQty(d.id);
                  return (
                    <li
                      key={d.id}
                      className="rounded-xl border border-gray-200 px-3 py-2 flex items-center gap-3"
                    >
                      <span className="flex-1 text-sm">{d.name}</span>
                      <span className="text-xs font-bold text-brand-blue">
                        {d.priceKwd === 0 ? "Free" : `${d.priceKwd}`}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setDrinkQty(d.id, qty - 1)}
                          disabled={qty === 0}
                          className="h-7 w-7 rounded-full bg-gray-100 text-brand-blue font-bold leading-none disabled:opacity-40"
                        >
                          −
                        </button>
                        <span className="w-5 text-center text-sm font-bold tabular-nums">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setDrinkQty(d.id, qty + 1)}
                          className="h-7 w-7 rounded-full bg-brand-blue text-white font-bold leading-none"
                        >
                          +
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        )}

        <Field label="Notes (optional)">
          <textarea
            className="input min-h-[64px]"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Hot oil after, no fade, walk-in 14:30…"
          />
        </Field>

        <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Total</span>
            <span className="font-extrabold text-brand-blue">
              {totals.priceKwd} KWD · {totals.durationMin} min
            </span>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 font-semibold">{error}</p>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="btn-primary w-full"
        >
          {pending ? "Creating…" : "Create booking"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-gray-400 mt-0.5">{hint}</p>}
    </div>
  );
}
