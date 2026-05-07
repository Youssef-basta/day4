"use client";

import { useMemo, useState, useTransition } from "react";
import { BrandHeader } from "@/components/BrandHeader";
import { formatDateLong, formatTime } from "@/lib/format";
import { bookingTotals } from "@/lib/pricing";
import { t as tFn, type DictKey, type Locale } from "@/lib/i18n";
import type {
  Addon,
  Drink,
  DrinkOrder,
  PaymentMethod,
  Service,
  Slot,
} from "@/lib/types";
import { createBookingAction } from "./actions";

type Step = 1 | 2 | 3 | 4 | 5;

export function BookingWizard({
  services,
  addons,
  drinks,
  slots,
  brandName,
  phonePlaceholder,
  locale,
}: {
  services: Service[];
  addons: Addon[];
  drinks: Drink[];
  slots: Slot[];
  brandName: string;
  phonePlaceholder: string;
  locale: Locale;
}) {
  const t = (key: DictKey, vars?: Record<string, string | number>) =>
    tFn(locale, key, vars);
  const [step, setStep] = useState<Step>(1);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [drinkOrders, setDrinkOrders] = useState<DrinkOrder[]>([]);
  const [slotId, setSlotId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
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
    ? bookingTotals(
        { serviceId, addonIds, drinkOrders },
        services,
        addons,
        drinks
      )
    : {
        priceKwd: 0,
        durationMin: 0,
        addons: [],
        drinks: [],
        service: undefined,
      };

  // Kuwait local mobile numbers are 8 digits.
  const phoneDigits = phone.replace(/\D/g, "");
  const phoneValid = phoneDigits.length === 8;
  const phoneError =
    phoneTouched && phone.length > 0 && !phoneValid
      ? "Phone must be 8 digits."
      : null;

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

  const hotDrinks = drinks.filter((d) => d.temperature === "hot");
  const coldDrinks = drinks.filter((d) => d.temperature === "cold");

  const slotsByDate = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const s of slots) {
      const arr = map.get(s.date) ?? [];
      arr.push(s);
      map.set(s.date, arr);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [slots]);

  const hasAnyOpen = slots.some((s) => s.isOpen);

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
          drinkOrders,
          slotId,
          customerName: name.trim(),
          phone: `+965${phoneDigits}`,
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
      <BrandHeader brandName={brandName} />
      <main className="mx-auto max-w-md px-4 py-6 pb-40">
        <Stepper step={step} t={t} />

        {step === 1 && (
          <section>
            <h1 className="text-xl font-bold text-brand-blue mb-3">
              {t("book.pickService")}
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
                  {t("book.addonsTitle")}
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
                    {t("book.totalDuration", { min: totals.durationMin })}
                  </span>
                  <span className="font-bold text-brand-blue">
                    {totals.priceKwd} KWD
                  </span>
                </div>
              </div>
            )}
          </section>
        )}

        {step === 2 && (
          <section>
            <h1 className="text-xl font-bold text-brand-blue mb-3">
              {t("book.pickTime")}
            </h1>
            {!hasAnyOpen ? (
              <p className="card text-sm text-gray-600">
                {t("book.noOpenSlots")}
              </p>
            ) : (
              <>
                <div className="flex items-center gap-3 text-[11px] text-gray-600 mb-3">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-3 w-3 rounded-full bg-green-500" />
                    {t("book.available")}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-3 w-3 rounded-full bg-red-500" />
                    {t("book.booked")}
                  </span>
                </div>
                <div className="space-y-5">
                  {slotsByDate.map(([date, daySlots]) => (
                    <div key={date}>
                      <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">
                        {formatDateLong(date)}
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {daySlots.map((s) => {
                          const selected = slotId === s.id;
                          const booked = !s.isOpen;
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => !booked && setSlotId(s.id)}
                              disabled={booked}
                              aria-label={
                                booked
                                  ? `${formatTime(s.time)} — booked`
                                  : `${formatTime(s.time)} — available`
                              }
                              className={`rounded-xl border-2 px-2 py-3 text-sm font-semibold transition ${
                                booked
                                  ? "bg-red-50 border-red-200 text-red-400 line-through cursor-not-allowed"
                                  : selected
                                  ? "bg-brand-blue text-white border-brand-blue"
                                  : "bg-green-50 border-green-300 text-green-800"
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
              </>
            )}
          </section>
        )}

        {step === 3 && (
          <section>
            <h1 className="text-xl font-bold text-brand-blue mb-1">
              {t("book.refreshmentsTitle")}
            </h1>
            <p className="text-xs text-gray-500 mb-4">
              {t("book.refreshmentsSub")}
            </p>

            {drinks.length === 0 ? (
              <p className="card text-sm text-gray-600">
                No drinks available right now.
              </p>
            ) : (
              <>
                {hotDrinks.length > 0 && (
                  <DrinkGroup
                    label="Hot"
                    accent="bg-orange-100 text-orange-700"
                    drinks={hotDrinks}
                    getQty={getDrinkQty}
                    setQty={setDrinkQty}
                  />
                )}
                {coldDrinks.length > 0 && (
                  <DrinkGroup
                    label="Cold"
                    accent="bg-sky-100 text-sky-700"
                    drinks={coldDrinks}
                    getQty={getDrinkQty}
                    setQty={setDrinkQty}
                  />
                )}
              </>
            )}
          </section>
        )}

        {step === 4 && (
          <section>
            <h1 className="text-xl font-bold text-brand-blue mb-3">
              {t("book.yourDetails")}
            </h1>
            <form
              id="step4-form"
              onSubmit={(e) => {
                e.preventDefault();
                setPhoneTouched(true);
                if (!name.trim() || !phoneValid) return;
                setStep(5);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-semibold mb-1">
                  {t("book.fullName")}
                </label>
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("book.fullNamePh")}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  {t("book.phoneNumber")}
                </label>
                <div className="flex items-stretch rounded-xl border border-gray-300 focus-within:ring-2 focus-within:ring-brand-blue overflow-hidden">
                  <span className="px-3 py-3 bg-gray-50 text-gray-600 text-sm font-semibold border-r border-gray-300 select-none">
                    +965
                  </span>
                  <input
                    className="flex-1 px-4 py-3 text-base focus:outline-none"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    pattern="[0-9]{8}"
                    maxLength={8}
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, "").slice(0, 8))
                    }
                    onBlur={() => setPhoneTouched(true)}
                    placeholder={t("book.phonePh")}
                    aria-invalid={Boolean(phoneError)}
                    required
                  />
                </div>
                {phoneError ? (
                  <p className="text-xs text-red-600 font-semibold mt-1">
                    {t("book.phoneError")}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    {t("book.phoneExample")}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  {t("book.notes")}{" "}
                  <span className="text-gray-400 font-normal">
                    {t("book.notesOptional")}
                  </span>
                </label>
                <textarea
                  className="input min-h-[88px]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t("book.notesPh")}
                />
              </div>
            </form>
          </section>
        )}

        {step === 5 && (
          <section>
            <h1 className="text-xl font-bold text-brand-blue mb-3">
              {t("book.payment")}
            </h1>

            <div className="card mb-4 text-sm">
              <p className="font-semibold text-brand-blue mb-2">
                {t("book.orderSummary")}
              </p>
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
              {totals.drinks.map((l) => (
                <div
                  key={l.drink.id}
                  className="flex justify-between text-gray-600 text-xs mt-1"
                >
                  <span>
                    {l.qty}× {l.drink.name}
                  </span>
                  <span>+{l.subtotal} KWD</span>
                </div>
              ))}
              <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between text-sm">
                <span className="font-semibold">{t("book.totalLabel")}</span>
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
                title={t("book.payVisa")}
                hint={t("book.payVisaHint")}
                selected={paymentMethod === "visa"}
                onSelect={() => setPaymentMethod("visa")}
                icon={<span className="font-black text-lg italic">VISA</span>}
              />
              <PaymentOption
                id="knet"
                title={t("book.payKnet")}
                hint={t("book.payKnetHint")}
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
                title={t("book.payCash")}
                hint={t("book.payCashHint")}
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
                <p className="font-semibold text-brand-blue">
                  {t("book.payOnArrival")}
                </p>
                <p className="text-gray-600 mt-1">
                  {t("book.cashHint", { n: totals.priceKwd })}
                </p>
              </div>
            )}

            {paymentError && (
              <p className="text-sm text-red-600 font-semibold mt-3">
                {paymentError}
              </p>
            )}
          </section>
        )}
      </main>

      <StickyActionBar>
        {step === 1 && (
          <>
            <SummaryLine>
              {service ? (
                <span className="truncate">
                  <span className="font-semibold text-gray-700">
                    {service.name}
                  </span>
                  {addonIds.length > 0 && (
                    <span className="text-gray-500">
                      {" "}
                      + {addonIds.length} add-on
                      {addonIds.length > 1 ? "s" : ""}
                    </span>
                  )}
                </span>
              ) : (
                <span>{t("book.pickServiceFirst")}</span>
              )}
              {serviceId && (
                <span className="font-extrabold text-brand-blue whitespace-nowrap">
                  {totals.priceKwd} KWD
                </span>
              )}
            </SummaryLine>
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!serviceId}
              className="btn-primary w-full"
            >
              {t("book.continue")}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <SummaryLine>
              {slot ? (
                <span className="truncate">
                  <span className="font-semibold text-gray-700">
                    {formatDateLong(slot.date)}
                  </span>
                  <span className="text-gray-500"> · {formatTime(slot.time)}</span>
                </span>
              ) : (
                <span>{t("book.pickTimeFirst")}</span>
              )}
              <span className="font-extrabold text-brand-blue whitespace-nowrap">
                {totals.priceKwd} KWD
              </span>
            </SummaryLine>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-outline flex-1"
              >
                {t("book.back")}
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={!slotId}
                className="btn-primary flex-1"
              >
                {t("book.continue")}
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <SummaryLine>
              <span className="text-gray-500 truncate">
                {totals.drinks.length === 0
                  ? t("book.noDrinks")
                  : `${totals.drinks.reduce((s, l) => s + l.qty, 0)} ${t("step.drinks")}`}
              </span>
              <span className="font-extrabold text-brand-blue whitespace-nowrap">
                {totals.priceKwd} KWD
              </span>
            </SummaryLine>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-outline flex-1"
              >
                {t("book.back")}
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="btn-primary flex-1"
              >
                {totals.drinks.length === 0 ? t("book.skip") : t("book.continue")}
              </button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <SummaryLine>
              <span className="text-gray-500">
                {totals.durationMin} min · {service?.name ?? ""}
              </span>
              <span className="font-extrabold text-brand-blue whitespace-nowrap">
                {totals.priceKwd} KWD
              </span>
            </SummaryLine>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="btn-outline flex-1"
              >
                {t("book.back")}
              </button>
              <button
                type="submit"
                form="step4-form"
                className="btn-primary flex-1"
              >
                {t("book.continue")}
              </button>
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <SummaryLine>
              <span className="text-gray-500 truncate">
                {paymentMethod === "cash"
                  ? t("book.cashOnSite")
                  : paymentMethod
                  ? `${paymentMethod.toUpperCase()} payment`
                  : t("book.choosePayment")}
              </span>
              <span className="font-extrabold text-brand-blue whitespace-nowrap">
                {totals.priceKwd} KWD
              </span>
            </SummaryLine>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(4)}
                disabled={isPending}
                className="btn-outline flex-1"
              >
                {t("book.back")}
              </button>
              <button
                type="button"
                onClick={handlePayAndConfirm}
                disabled={!paymentMethod || isPending}
                className="btn-primary flex-1"
              >
                {isPending
                  ? t("book.processing")
                  : paymentMethod === "cash"
                  ? t("book.confirmBooking")
                  : t("book.payN", { n: totals.priceKwd })}
              </button>
            </div>
          </>
        )}
      </StickyActionBar>
    </>
  );
}

function StickyActionBar({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-20 bg-white/95 backdrop-blur border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="mx-auto max-w-md px-4 py-3 space-y-2">{children}</div>
    </div>
  );
}

function SummaryLine({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      {children}
    </div>
  );
}

function DrinkGroup({
  label,
  accent,
  drinks,
  getQty,
  setQty,
}: {
  label: string;
  accent: string;
  drinks: Drink[];
  getQty: (id: string) => number;
  setQty: (id: string, qty: number) => void;
}) {
  return (
    <div className="mb-4">
      <p
        className={`chip ${accent} mb-2 text-[10px] uppercase tracking-wider`}
      >
        {label}
      </p>
      <ul className="space-y-2">
        {drinks.map((d) => {
          const qty = getQty(d.id);
          return (
            <li
              key={d.id}
              className={`card !py-3 flex items-center gap-3 ${
                qty > 0 ? "ring-2 ring-brand-blue bg-brand-blue/[0.03]" : ""
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-tight">{d.name}</p>
                {d.description && (
                  <p className="text-[11px] text-gray-500 leading-tight">
                    {d.description}
                  </p>
                )}
                <p className="text-xs font-bold text-brand-blue mt-0.5">
                  {d.priceKwd === 0 ? "Free" : `${d.priceKwd} KWD`}
                </p>
              </div>
              {qty === 0 ? (
                <button
                  type="button"
                  onClick={() => setQty(d.id, 1)}
                  className="rounded-xl border-2 border-brand-blue text-brand-blue font-bold text-xs px-3 py-1.5"
                >
                  + Add
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setQty(d.id, qty - 1)}
                    aria-label="Decrease"
                    className="h-8 w-8 rounded-full bg-gray-100 text-brand-blue font-bold text-lg leading-none flex items-center justify-center"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-bold tabular-nums">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty(d.id, qty + 1)}
                    aria-label="Increase"
                    className="h-8 w-8 rounded-full bg-brand-blue text-white font-bold text-lg leading-none flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
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

function Stepper({
  step,
  t,
}: {
  step: Step;
  t: (key: DictKey, vars?: Record<string, string | number>) => string;
}) {
  const labels = [
    t("step.service"),
    t("step.time"),
    t("step.drinks"),
    t("step.details"),
    t("step.pay"),
  ];
  return (
    <div className="mb-6">
      <ol className="flex items-center gap-1.5">
        {labels.map((label, i) => {
          const n = (i + 1) as Step;
          const active = n === step;
          const done = n < step;
          return (
            <li
              key={label}
              className={`flex items-center ${active ? "" : "shrink-0"} ${
                i < labels.length - 1 ? "flex-1" : ""
              }`}
            >
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
              {active && (
                <span className="ml-2 text-[11px] font-semibold text-brand-blue">
                  {label}
                </span>
              )}
              {i < labels.length - 1 && (
                <span className="flex-1 h-px bg-gray-200 ml-2" />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
