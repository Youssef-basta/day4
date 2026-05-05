"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { formatDateLong, formatTime } from "@/lib/format";

export default function AdminSlotsPage() {
  const { slots, toggleSlot, bookings } = useStore();

  const bookedSlotIds = useMemo(() => {
    return new Set(
      bookings.filter((b) => b.status !== "cancelled").map((b) => b.slotId)
    );
  }, [bookings]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof slots>();
    for (const s of slots) {
      const arr = map.get(s.date) ?? [];
      arr.push(s);
      map.set(s.date, arr);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [slots]);

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
                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={booked}
                    onClick={() => toggleSlot(s.id)}
                    className={`rounded-xl border px-2 py-3 text-sm font-semibold transition ${
                      booked
                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                        : open
                        ? "bg-white border-brand-blue text-brand-blue"
                        : "bg-gray-200 text-gray-500 border-gray-200 line-through"
                    }`}
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
