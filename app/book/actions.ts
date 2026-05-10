"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapBooking } from "@/lib/db/map";
import { executePayment, isMyFatoorahEnabled } from "@/lib/myfatoorah";
import type { DrinkOrder, PaymentMethod } from "@/lib/types";

export type CreateBookingInput = {
  customerName: string;
  phone: string;
  serviceId: string;
  addonIds: string[];
  drinkOrders: DrinkOrder[];
  slotId: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  cardLast4?: string;
  /** Final total in KWD (services + addons + drinks) — needed for the gateway. */
  totalKwd: number;
};

export type CreateBookingResult =
  | { ok: true; bookingId: string }
  | { ok: false; error: string }
  /**
   * KNET / Visa: customer must finish payment on MyFatoorah's hosted page.
   * Client should set window.location.href = paymentUrl.
   */
  | { ok: true; redirect: "gateway"; paymentUrl: string };

export async function createBookingAction(
  input: CreateBookingInput
): Promise<CreateBookingResult> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("create_booking", {
    p_customer_name: input.customerName,
    p_phone: input.phone,
    p_service_id: input.serviceId,
    p_addon_ids: input.addonIds,
    p_slot_id: input.slotId,
    p_notes: input.notes ?? null,
    p_payment_method: input.paymentMethod,
    p_card_last4: input.cardLast4 ?? null,
    p_drink_orders: input.drinkOrders.filter((d) => d.qty > 0),
  });

  if (error) {
    if (error.message.includes("slot_unavailable")) {
      return {
        ok: false,
        error: "That slot was just taken — please pick another.",
      };
    }
    if (error.message.includes("slot_not_found")) {
      return { ok: false, error: "That slot no longer exists." };
    }
    return { ok: false, error: "Something went wrong. Please try again." };
  }

  const booking = mapBooking(data as never);

  // Cash → confirmation immediately.
  if (input.paymentMethod === "cash") {
    redirect(`/confirmation/${booking.id}`);
  }

  // KNET / Visa → call MyFatoorah for a hosted PaymentURL, then redirect.
  if (!isMyFatoorahEnabled()) {
    // No gateway configured — leave the booking as 'pending' and surface
    // a clear error. Customer can retry with cash on site.
    return {
      ok: false,
      error:
        "Card payments aren't configured right now. Please pick Cash on site or try again later.",
    };
  }

  try {
    const { paymentUrl, invoiceId } = await executePayment({
      method: input.paymentMethod === "knet" ? "knet" : "visa",
      amountKwd: input.totalKwd,
      customerName: input.customerName,
      customerMobile: input.phone,
      bookingRef: booking.ref,
      bookingId: booking.id,
    });

    // Stash the PaymentURL + invoice id so we can recover or display.
    const admin = createAdminClient();
    await admin
      .from("bookings")
      .update({
        payment_url: paymentUrl,
        payment_invoice_id: invoiceId,
      })
      .eq("id", booking.id);

    return { ok: true, redirect: "gateway", paymentUrl };
  } catch (e: unknown) {
    // Gateway failed before we even sent the customer over. Roll the slot
    // back so the booking doesn't sit in a stuck-pending state.
    const admin = createAdminClient();
    await admin
      .from("bookings")
      .update({
        status: "cancelled",
        cancellation_reason: "payment_failed",
        payment_status: "unpaid",
      })
      .eq("id", booking.id);
    await admin
      .from("slots")
      .update({ is_open: true })
      .eq("id", booking.slotId);

    const msg = e instanceof Error ? e.message : "Payment gateway error";
    return { ok: false, error: msg };
  }
}
