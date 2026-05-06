import Link from "next/link";
import { StatusChip } from "./StatusChip";
import { PaymentBadge } from "./PaymentBadge";
import { formatDateLong, formatTime } from "@/lib/format";
import type { Booking, Service, Slot, Staff } from "@/lib/types";

export function BookingRow({
  booking,
  service,
  slot,
  staff,
}: {
  booking: Booking;
  service?: Service;
  slot?: Slot;
  staff?: Staff;
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
          {staff && (
            <span className="chip bg-blue-100 text-brand-blue px-2 py-0.5 text-[10px]">
              👤 {staff.name}
            </span>
          )}
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
