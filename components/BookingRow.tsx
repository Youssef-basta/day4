import Link from "next/link";
import { StatusChip } from "./StatusChip";
import { PaymentBadge } from "./PaymentBadge";
import { formatDateLong, formatTime } from "@/lib/format";
import type { Booking, Service, Slot } from "@/lib/types";

export function BookingRow({
  booking,
  service,
  slot,
}: {
  booking: Booking;
  service?: Service;
  slot?: Slot;
}) {
  return (
    <Link
      href={`/admin/bookings/${booking.id}`}
      className="card flex items-center justify-between gap-3"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold truncate">{booking.customerName}</p>
          <StatusChip
            status={booking.status}
            reason={booking.cancellationReason}
          />
          <PaymentBadge booking={booking} />
        </div>
        <p className="text-xs text-gray-500 truncate">
          {service?.name ?? "—"} ·{" "}
          {slot ? `${formatDateLong(slot.date)} ${formatTime(slot.time)}` : "—"}
        </p>
        <p className="text-[11px] font-mono text-gray-400 mt-0.5">{booking.ref}</p>
      </div>
      <span className="text-brand-blue text-sm font-bold">›</span>
    </Link>
  );
}
