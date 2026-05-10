import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaymentStatus } from "@/lib/myfatoorah";

// MyFatoorah redirects the customer here after payment. We accept both GET
// (with query params) and POST (with form body) and try multiple parameter
// names since the docs vary by version: paymentId, Id, PaymentId.

async function readPaymentId(req: NextRequest): Promise<{
  paymentId: string | null;
  raw: string;
  hadError: boolean;
}> {
  const url = req.nextUrl;
  const explicitError = url.searchParams.get("status") === "error";

  let paymentId =
    url.searchParams.get("paymentId") ??
    url.searchParams.get("PaymentId") ??
    url.searchParams.get("Id") ??
    url.searchParams.get("id");

  let bodyDump = "";

  // Try POST form body if missing on URL.
  if (!paymentId && req.method === "POST") {
    try {
      const ct = req.headers.get("content-type") ?? "";
      if (ct.includes("application/x-www-form-urlencoded")) {
        const form = await req.formData();
        bodyDump = Array.from(form.entries())
          .map(([k, v]) => `${k}=${v}`)
          .join("&");
        paymentId =
          (form.get("paymentId") as string | null) ??
          (form.get("PaymentId") as string | null) ??
          (form.get("Id") as string | null) ??
          (form.get("id") as string | null);
      } else if (ct.includes("application/json")) {
        const json = await req.json();
        bodyDump = JSON.stringify(json);
        paymentId =
          json.paymentId ?? json.PaymentId ?? json.Id ?? json.id ?? null;
      }
    } catch {
      // ignore
    }
  }

  return { paymentId: paymentId ?? null, raw: bodyDump, hadError: explicitError };
}

async function finalize(req: NextRequest) {
  const url = req.nextUrl;
  const root = `${url.protocol}//${url.host}`;
  const { paymentId, raw, hadError } = await readPaymentId(req);

  // Diagnostic logging — visible in Vercel runtime logs.
  console.log("[mf-callback]", {
    method: req.method,
    fullUrl: url.toString(),
    paymentId,
    hadError,
    body: raw || undefined,
  });

  if (!paymentId || hadError) {
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
    console.log("[mf-callback] verified", {
      paymentId,
      invoiceStatus,
      bookingId,
    });
  } catch (e: unknown) {
    console.error("[mf-callback] getPaymentStatus failed", e);
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
      console.error("[mf-callback] update failed", error);
      return NextResponse.redirect(
        `${root}/payment-failed?reason=update_failed`,
        303
      );
    }
    return NextResponse.redirect(`${root}/confirmation/${bookingId}`, 303);
  }

  // Failed / Expired / Pending — cancel and reopen the slot.
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
