"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  markPaidAction,
  updateBookingStatusAction,
} from "@/app/admin/actions";
import type { Booking } from "@/lib/types";

export function BookingActions({ booking }: { booking: Booking }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function markDone() {
    startTransition(async () => {
      await updateBookingStatusAction(booking.id, "done");
      router.refresh();
    });
  }

  function cancel() {
    if (!confirm("Cancel this booking? The slot will reopen.")) return;
    startTransition(async () => {
      await updateBookingStatusAction(booking.id, "cancelled");
      router.push("/admin/bookings");
    });
  }

  function markPaid() {
    startTransition(async () => {
      await markPaidAction(booking.id);
      router.refresh();
    });
  }

  return (
    <>
      {booking.paymentMethod === "cash" &&
        booking.paymentStatus === "unpaid" &&
        booking.status !== "cancelled" && (
          <button
            onClick={markPaid}
            disabled={pending}
            className="btn-primary w-full mt-4"
          >
            {pending ? "Saving…" : "Mark cash as Paid"}
          </button>
        )}

      {booking.status === "pending" && (
        <div className="mt-5 flex gap-3">
          <button
            onClick={cancel}
            disabled={pending}
            className="btn-outline flex-1"
          >
            Cancel
          </button>
          <button
            onClick={markDone}
            disabled={pending}
            className="btn-accent flex-1"
          >
            {pending ? "Saving…" : "Mark as Done"}
          </button>
        </div>
      )}
    </>
  );
}
