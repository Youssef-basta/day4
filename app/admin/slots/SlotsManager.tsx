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
      <p className="text-sm text-gray-500 mb-3">
        Open or close any slot. Booked slots are locked until the booking
        ends.
      </p>

      <div className="card flex items-center justify-around text-[11px] mb-4">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-green-500" /> Open
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-500" /> Closed
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-gray-400" /> Booked
        </span>
      </div>

      <div className="space-y-6">
        {grouped.map(([date, daySlots]) => (
          <section key={date}>
            <h2 className="text-xs uppercase tracking-wider text-gray-500 mb-2 font-semibold">
              {formatDateLong(date)}
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {daySlots.map((s) => {
                const booked = bookedSlotIds.has(s.id);
                const open = s.isOpen;
                const busy = isPending && pendingId === s.id;

                if (booked) {
                  return (
                    <div
                      key={s.id}
                      className="rounded-xl border-2 border-gray-200 bg-gray-100 text-gray-500 px-2 py-2 text-center cursor-not-allowed"
                      aria-label={`${formatTime(s.time)} — booked`}
                    >
                      <p className="text-sm font-bold">{formatTime(s.time)}</p>
                      <p className="text-[10px] uppercase mt-0.5">Booked</p>
                    </div>
                  );
                }

                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={busy}
                    onClick={() => toggle(s.id)}
                    aria-label={
                      open
                        ? `${formatTime(s.time)} is open — close it`
                        : `${formatTime(s.time)} is closed — open it`
                    }
                    className={`rounded-xl border-2 px-2 py-2 text-center transition active:scale-[.97] ${
                      open
                        ? "bg-green-50 border-green-500 text-green-800"
                        : "bg-red-50 border-red-300 text-red-700"
                    } ${busy ? "opacity-50" : ""}`}
                  >
                    <p className="text-sm font-bold">{formatTime(s.time)}</p>
                    <p
                      className={`text-[10px] uppercase mt-0.5 font-bold ${
                        open ? "text-green-700" : "text-red-600"
                      }`}
                    >
                      {open ? (
                        <span>Tap to Close</span>
                      ) : (
                        <span>Tap to Open</span>
                      )}
                    </p>
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
