import type { BookingStatus } from "@/lib/types";

export function StatusChip({ status }: { status: BookingStatus }) {
  const styles: Record<BookingStatus, string> = {
    pending: "bg-brand-yellow text-brand-blue",
    done: "bg-green-100 text-green-800",
    cancelled: "bg-gray-200 text-gray-600 line-through",
  };
  const label: Record<BookingStatus, string> = {
    pending: "Pending",
    done: "Done",
    cancelled: "Cancelled",
  };
  return <span className={`chip ${styles[status]}`}>{label[status]}</span>;
}
