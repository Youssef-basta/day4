"use client";

import { useMemo, useState, useTransition } from "react";
import { BrandHeader } from "@/components/BrandHeader";
import { formatDateLong, formatTime } from "@/lib/format";
import { bookingTotals } from "@/lib/pricing";
import type { Addon, PaymentMethod, Service, Slot } from "@/lib/types";
import { createBookingAction } from "./actions";

type Step = 1 | 2 | 3 | 4;

export function BookingWizard({
  services,
  addons,
  slots,
}: {
  services: Service[];
  addons: Addon[];
  slots: Slot[];
}) {
  const [step, setStep] = useState<Step>(1);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [slotId, setSlotId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [knetCard, setKnetCard] = useState("");
  const [knetPin, setKnetPin] = useState("");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const service = services.find((s) => s.id === serviceId);
  const slot = slots.find((s) => s.id === slotId);

  const totals = serviceId
    ? bookingTotals({ serviceId, addonIds }, services, addons)
    : { priceKwd: 0, durationMin: 0, addons: [], service: undefined };

  function toggleAddon(id: string) {
    setAddonIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  const slotsByDate = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const s of slots) {
      const arr = map.get(s.date) ?? [];
      arr.push(s);
      map.set(s.date, arr);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [slots]);

  function paymentReady(): boolean {
    if (!paymentMethod) return false;
    if (paymentMethod === "cash") return true;
    if (paymentMethod === "visa") {
      return (
        cardNumber.replace(/\s/g, "").length >= 13 &&
        cardName.trim().length > 1 &&
        /^\d{2}\/\d{2}$/.test(cardExpiry) &&
        /^\d{3,4}$/.test(cardCvv)
      );
    }
    if (paymentMethod === "knet") {
      return (
        knetCard.replace(/\s/g, "").length >= 12 &&
        /^\d{4,6}$/.test(knetPin)
      );
    }
    return false;
  }

  function handlePayAndConfirm() {
    if (!serviceId || !slotId || !paymentMethod) return;
    if (!paymentReady()) {
      setPaymentError("Please complete the payment details.");
      return;
    }
    setPaymentError(null);

    const submit = () => {
      const last4 =
        paymentMethod === "visa"
          ? cardNumber.replace(/\s/g, "").slice(-4)
          : paymentMethod === "knet"
          ? knetCard.replace(/\s/g, "").slice(-4)
          : undefined;

      startTransition(async () => {
        const res = await createBookingAction({
          serviceId,
          addonIds,
          slotId,
          customerName: name.trim(),
          phone: phone.trim(),
          notes: notes.trim() || undefined,
          paymentMethod,
          cardLast4: last4,
        });
        if (res && !res.ok) {
          setPaymentError(res.error);
        }
        // Success path redirects server-side; nothing to do here.
      });
    };

    if (paymentMethod === "cash") {
      submit();
    } else {
      // Fake gateway delay so the demo feels real.
      setTimeout(submit, 900);
    }
  }

  return (
    <>
      <BrandHeader />
      <main className="mx-auto max-w-md px-4 py-6 pb-24">
        <Stepper step={step} />

        {step === 1 && (
          <section>
            <h1 className="text-xl font-bold text-brand-blue mb-3">
              Pick a service
            </h1>
            <ul className="space-y-3">
              {services.map((s) => {
                const selected = serviceId === s.id;
                const premium = s.tier === "premium";
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => setServiceId(s.id)}
                      className={`card w-full text-left flex items-start justify-between gap-3 ${
                        selected
                          ? "ring-2 ring-brand-blue"
                          : premium
                          ? "ring-1 ring-brand-yellow/60 bg-gradient-to-br from-white to-amber-50"
                          : ""
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold">{s.name}</p>
                          {premium && (
                            <span className="chip bg-brand-yellow text-brand-blue px-2 py-0.5 text-[10px]">
                              Premium
                            </span>
                          )}
                        </div>
                        {s.description && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {s.description}
                          </p>
                        )}
                        <p className="text-[11px] text-gray-400 mt-1">
                          {s.durationMin} min
                        </p>
                      </div>
                      <p className="font-bold text-brand-blue whitespace-nowrap">
                        {s.priceKwd} KWD
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>

            {serviceId && (
              <div className="mt-6">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Add-ons (optional)
                </h2>
                <ul className="space-y-2">
                  {addons.map((a) => {
                    const checked = addonIds.includes(a.id);
                    return (
                      <li key={a.id}>
                        <button
                          type="button"
                          onClick={() => toggleAddon(a.id)}
                          aria-pressed={checked}
                          className={`card w-full text-left flex items-center gap-3 !py-3 ${
                            checked
                              ? "ring-2 ring-brand-blue bg-brand-blue/[0.03]"
                              : ""
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
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    Total · {totals.durationMin} min
                  </span>
                  <span className="font-bold text-brand-blue">
                    {totals.priceKwd} KWD
                  </span>
                </div>
              </div>
            )}

            <div className="mt-6">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!serviceId}
                className="btn-primary w-full"
              >
                Continue
              </button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section>
            <h1 className="text-xl font-bold text-brand-blue mb-3">
              Pick a time
            </h1>
            {slotsByDate.length === 0 ? (
              <p className="card text-sm text-gray-600">
                No open time slots right now. Please check back later.
              </p>
            ) : (
              <div className="space-y-5">
                {slotsByDate.map(([date, daySlots]) => (
                  <div key={date}>
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">
                      {formatDateLong(date)}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {daySlots.map((s) => {
                        const selected = slotId === s.id;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setSlotId(s.id)}
                            className={`rounded-xl border px-2 py-3 text-sm font-semibold transition ${
                              selected
                                ? "bg-brand-blue text-white border-brand-blue"
                                : "bg-white border-gray-200 text-gray-800"
                            }`}
                          >
                            {formatTime(s.time)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-outline flex-1"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={!slotId}
                className="btn-primary flex-1"
              >
                Continue
              </button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section>
            <h1 className="text-xl font-bold text-brand-blue mb-3">
              Your details
            </h1>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!name.trim() || !phone.trim()) return;
                setStep(4);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Full name
                </label>
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ahmed Al-Sabah"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Phone number
                </label>
                <input
                  className="input"
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+965 5000 0000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Notes <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  className="input min-h-[88px]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any preferences for your barber?"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-outline flex-1"
                >
                  Back
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Continue
                </button>
              </div>
            </form>
          </section>
        )}

        {step === 4 && (
          <section>
            <h1 className="text-xl font-bold text-brand-blue mb-3">
              Payment
            </h1>

            <div className="card mb-4 text-sm">
              <p className="font-semibold text-brand-blue mb-2">Order summary</p>
              <div className="flex justify-between">
                <span>{service?.name ?? "—"}</span>
                <span className="font-bold">{service?.priceKwd ?? 0} KWD</span>
              </div>
              {totals.addons.map((a) => (
                <div
                  key={a.id}
                  className="flex justify-between text-gray-600 text-xs mt-1"
                >
                  <span>+ {a.name}</span>
                  <span>+{a.priceKwd} KWD</span>
                </div>
              ))}
              <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between text-sm">
                <span className="font-semibold">Total</span>
                <span className="font-extrabold text-brand-blue">
                  {totals.priceKwd} KWD
                </span>
              </div>
              {slot && (
                <p className="text-gray-500 text-xs mt-2">
                  {formatDateLong(slot.date)} · {formatTime(slot.time)} ·{" "}
                  {totals.durationMin} min
                </p>
              )}
            </div>

            <div className="space-y-2 mb-4">
              <PaymentOption
                id="visa"
                title="Visa / Mastercard"
                hint="Pay now, secure online"
                selected={paymentMethod === "visa"}
                onSelect={() => setPaymentMethod("visa")}
                icon={<span className="font-black text-lg italic">VISA</span>}
              />
              <PaymentOption
                id="knet"
                title="KNET"
                hint="Pay now with your Kuwait bank card"
                selected={paymentMethod === "knet"}
                onSelect={() => setPaymentMethod("knet")}
                icon={
                  <span className="font-black text-sm tracking-tight">
                    K-NET
                  </span>
                }
              />
              <PaymentOption
                id="cash"
                title="Cash on site"
                hint="Pay at the studio when you arrive"
                selected={paymentMethod === "cash"}
                onSelect={() => setPaymentMethod("cash")}
                icon={<span>💵</span>}
              />
            </div>

            {paymentMethod === "visa" && (
              <div className="card space-y-3">
                <p className="text-xs text-gray-500">
                  Demo only — no card data is stored or transmitted.
                </p>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Card number
                  </label>
                  <input
                    className="input font-mono tracking-wider"
                    inputMode="numeric"
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={(e) =>
                      setCardNumber(formatCardNumber(e.target.value))
                    }
                    maxLength={19}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Cardholder name
                  </label>
                  <input
                    className="input"
                    placeholder="AHMED AL-SABAH"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value.toUpperCase())}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Expiry
                    </label>
                    <input
                      className="input font-mono"
                      inputMode="numeric"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) =>
                        setCardExpiry(formatExpiry(e.target.value))
                      }
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      CVV
                    </label>
                    <input
                      className="input font-mono"
                      inputMode="numeric"
                      placeholder="123"
                      value={cardCvv}
                      onChange={(e) =>
                        setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                      }
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "knet" && (
              <div className="card space-y-3">
                <p className="text-xs text-gray-500">
                  Demo only — simulating the KNET gateway.
                </p>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    KNET card number
                  </label>
                  <input
                    className="input font-mono tracking-wider"
                    inputMode="numeric"
                    placeholder="0000 0000 0000"
                    value={knetCard}
                    onChange={(e) =>
                      setKnetCard(formatCardNumber(e.target.value))
                    }
                    maxLength={19}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    PIN
                  </label>
                  <input
                    className="input font-mono"
                    inputMode="numeric"
                    type="password"
                    placeholder="••••"
                    value={knetPin}
                    onChange={(e) =>
                      setKnetPin(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    maxLength={6}
                  />
                </div>
              </div>
            )}

            {paymentMethod === "cash" && (
              <div className="card text-sm">
                <p className="font-semibold text-brand-blue">Pay on arrival</p>
                <p className="text-gray-600 mt-1">
                  Bring {totals.priceKwd} KWD in cash to the studio. Your slot
                  is held until the start time.
                </p>
              </div>
            )}

            {paymentError && (
              <p className="text-sm text-red-600 font-semibold mt-3">
                {paymentError}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="btn-outline flex-1"
                disabled={isPending}
              >
                Back
              </button>
              <button
                type="button"
                onClick={handlePayAndConfirm}
                disabled={!paymentMethod || isPending}
                className="btn-accent flex-1"
              >
                {isPending
                  ? "Processing…"
                  : paymentMethod === "cash"
                  ? "Confirm booking"
                  : `Pay ${totals.priceKwd} KWD`}
              </button>
            </div>
          </section>
        )}
      </main>
    </>
  );
}

function PaymentOption({
  title,
  hint,
  selected,
  onSelect,
  icon,
}: {
  id: string;
  title: string;
  hint: string;
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`card w-full flex items-center gap-3 text-left transition ${
        selected ? "ring-2 ring-brand-blue" : ""
      }`}
    >
      <span className="h-10 w-14 rounded-md bg-brand-blue text-brand-yellow flex items-center justify-center text-sm">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold">{title}</p>
        <p className="text-xs text-gray-500">{hint}</p>
      </div>
      <span
        className={`h-5 w-5 rounded-full border-2 ${
          selected ? "border-brand-blue bg-brand-blue" : "border-gray-300"
        }`}
        aria-hidden
      />
    </button>
  );
}

function formatCardNumber(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(v: string) {
  const digits = v.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function Stepper({ step }: { step: Step }) {
  const labels = ["Service", "Time", "Details", "Pay"];
  return (
    <ol className="flex items-center gap-2 mb-6">
      {labels.map((label, i) => {
        const n = (i + 1) as Step;
        const active = n === step;
        const done = n < step;
        return (
          <li key={label} className="flex items-center gap-2 flex-1">
            <span
              className={`h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                active
                  ? "bg-brand-blue text-white"
                  : done
                  ? "bg-brand-yellow text-brand-blue"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {n}
            </span>
            <span
              className={`text-[11px] font-semibold ${
                active ? "text-brand-blue" : "text-gray-500"
              }`}
            >
              {label}
            </span>
            {i < labels.length - 1 && (
              <span className="flex-1 h-px bg-gray-200" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
