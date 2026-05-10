import type { Booking, BookingStatus, CancellationReason } from "@/lib/types";

const styles: Record<BookingStatus, string> = {
  pending: "bg-brand-yellow text-brand-blue",
  done: "bg-green-100 text-green-800",
  cancelled: "bg-gray-200 text-gray-600",
};

const baseLabel: Record<BookingStatus, string> = {
  pending: "Pending",
  done: "Done",
  cancelled: "Cancelled",
};

const reasonLabel: Record<CancellationReason, string> = {
  admin: "Cancelled",
  no_show: "No-show",
  payment_failed: "Payment failed",
};

export function StatusChip({
  status,
  reason,
}: {
  status: Booking["status"];
  reason?: Booking["cancellationReason"];
}) {
  const label =
    status === "cancelled" && reason ? reasonLabel[reason] : baseLabel[status];
  const accent =
    status === "cancelled" &&
    (reason === "no_show" || reason === "payment_failed");
  const cls = accent ? "bg-orange-100 text-orange-800" : styles[status];
  return <span className={`chip ${cls}`}>{label}</span>;
}
