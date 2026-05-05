"use client";

import { useMemo, useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDateLong, formatTime } from "@/lib/format";
import { toggleSlotAction } from "@/app/admin/actions";
import type { Booking, Slot } from "@/lib/types";

export function SlotsManager({
  slots,
  bookings,
}: {
  slots: Slot[];
  bookings: Booking[];
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const bookedSlotIds = useMemo(() => {
    return new Set(
      bookings.filter((b) => b.status !== "cancelled").map((b) => b.slotId)
    );
  }, [bookings]);

  const grouped = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const s of slots) {
      const arr = map.get(s.date) ?? [];
      arr.push(s);
      map.set(s.date, arr);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [slots]);

  function toggle(id: string) {
    setPendingId(id);
    startTransition(async () => {
      await toggleSlotAction(id);
      router.refresh();
      setPendingId(null);
    });
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-brand-blue mb-1">Slot manager</h1>
      <p className="text-sm text-gray-500 mb-4">
        Tap a slot to open or close it. Booked slots are locked.
      </p>

      <div className="space-y-5">
        {grouped.map(([date, daySlots]) => (
          <section key={date}>
            <h2 className="text-xs uppercase tracking-wider text-gray-500 mb-2">
              {formatDateLong(date)}
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {daySlots.map((s) => {
                const booked = bookedSlotIds.has(s.id);
                const open = s.isOpen;
                const busy = isPending && pendingId === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={booked || busy}
                    onClick={() => toggle(s.id)}
                    className={`rounded-xl border px-2 py-3 text-sm font-semibold transition ${
                      booked
                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                        : open
                        ? "bg-white border-brand-blue text-brand-blue"
                        : "bg-gray-200 text-gray-500 border-gray-200 line-through"
                    } ${busy ? "opacity-50" : ""}`}
                  >
                    {formatTime(s.time)}
                    <span className="block text-[10px] font-normal mt-0.5 opacity-70">
                      {booked ? "Booked" : open ? "Open" : "Closed"}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
