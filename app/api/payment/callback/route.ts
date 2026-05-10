import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaymentStatus } from "@/lib/myfatoorah";

// MyFatoorah hosted page redirects the customer here after payment, with
// `paymentId` (success) or sometimes empty (error path). We verify with the
// gateway, flip the booking to 'paid' on success, or cancel + reopen the
// slot on failure.

async function finalize(req: NextRequest) {
  const url = req.nextUrl;
  const paymentId = url.searchParams.get("paymentId");
  const explicitError = url.searchParams.get("status") === "error";
  const root = `${url.protocol}//${url.host}`;

  if (!paymentId || explicitError) {
    return NextResponse.redirect(
      `${root}/payment-failed?reason=cancelled`,
      303
    );
  }

  let bookingId: string | null = null;
  let resultIsPaid = false;
  let invoiceStatus = "Unknown";

  try {
    const data = await getPaymentStatus(paymentId);
    invoiceStatus = data.InvoiceStatus;
    bookingId = data.UserDefinedField; // we set this to bookings.id during ExecutePayment
    resultIsPaid = data.InvoiceStatus === "Paid";
  } catch (e: unknown) {
    return NextResponse.redirect(
      `${root}/payment-failed?reason=verify_failed`,
      303
    );
  }

  if (!bookingId) {
    return NextResponse.redirect(
      `${root}/payment-failed?reason=no_booking`,
      303
    );
  }

  const supabase = createAdminClient();

  if (resultIsPaid) {
    const { error } = await supabase
      .from("bookings")
      .update({
        payment_status: "paid",
        payment_intent_id: paymentId,
      })
      .eq("id", bookingId);
    if (error) {
      return NextResponse.redirect(
        `${root}/payment-failed?reason=update_failed`,
        303
      );
    }
    return NextResponse.redirect(`${root}/confirmation/${bookingId}`, 303);
  }

  // Failed / Expired / Pending (treat non-paid as failure for redirect-back)
  const { data: booking } = await supabase
    .from("bookings")
    .select("slot_id")
    .eq("id", bookingId)
    .maybeSingle();

  await supabase
    .from("bookings")
    .update({
      status: "cancelled",
      cancellation_reason: "payment_failed",
      payment_status: "unpaid",
      payment_intent_id: paymentId,
    })
    .eq("id", bookingId);

  if (booking?.slot_id) {
    await supabase
      .from("slots")
      .update({ is_open: true })
      .eq("id", booking.slot_id);
  }

  return NextResponse.redirect(
    `${root}/payment-failed?reason=${invoiceStatus.toLowerCase()}`,
    303
  );
}

export const GET = finalize;
export const POST = finalize;
