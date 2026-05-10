import Link from "next/link";
import { BrandHeader } from "@/components/BrandHeader";
import { CustomerHeaderActions } from "@/components/CustomerHeaderActions";
import { getStudioSettings } from "@/lib/db/catalog";
import { getCustomerSession } from "@/lib/db/customer";

export const dynamic = "force-dynamic";

const REASON_COPY: Record<string, { title: string; body: string }> = {
  cancelled: {
    title: "Payment cancelled",
    body: "Looks like you closed the payment page before finishing. Your slot has been released — try again whenever you're ready.",
  },
  verify_failed: {
    title: "Couldn't verify payment",
    body: "We couldn't reach the payment gateway to confirm your transaction. Your slot has been released — please try again.",
  },
  no_booking: {
    title: "Booking not found",
    body: "We couldn't match this payment to a booking. Please start a new booking.",
  },
  update_failed: {
    title: "Almost there",
    body: "Your payment went through but we couldn't save the booking. Please contact us with your transaction reference.",
  },
  failed: {
    title: "Payment failed",
    body: "The bank declined the transaction. Your slot has been released — try again or pick Cash on site.",
  },
  expired: {
    title: "Payment expired",
    body: "The payment session timed out. Your slot has been released — please try again.",
  },
  pending: {
    title: "Payment pending",
    body: "Your bank hasn't confirmed the payment yet. If you complete it shortly the booking will go through automatically; otherwise the slot will be released.",
  },
};

export default async function PaymentFailedPage({
  searchParams,
}: {
  searchParams?: { reason?: string };
}) {
  const reason = searchParams?.reason ?? "failed";
  const { title, body } = REASON_COPY[reason] ?? REASON_COPY.failed;

  const [settings, session] = await Promise.all([
    getStudioSettings(),
    getCustomerSession(),
  ]);

  return (
    <>
      <BrandHeader
        brandName={settings.brandName}
        rightSlot={<CustomerHeaderActions session={session} />}
      />
      <main className="mx-auto max-w-md px-4 py-8 pb-24">
        <div className="card text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-2xl font-black">
            ✕
          </div>
          <h1 className="text-xl font-bold text-brand-blue mt-3">{title}</h1>
          <p className="text-sm text-gray-600 mt-2 leading-snug">{body}</p>
        </div>

        <div className="mt-6 flex gap-3">
          <Link href="/" className="btn-outline flex-1">
            Home
          </Link>
          <Link href="/book" className="btn-primary flex-1">
            Try again
          </Link>
        </div>

        <p className="text-[11px] text-gray-500 mt-6 text-center">
          Need help? Reach the studio at{" "}
          {settings.phone ? (
            <a href={`tel:${settings.phone}`} className="font-semibold">
              {settings.phone}
            </a>
          ) : (
            "the studio"
          )}
          .
        </p>
      </main>
    </>
  );
}
