"use client";

import { useMemo, useState } from "react";
import { BookingRow } from "@/components/BookingRow";
import { EmptyState } from "@/components/EmptyState";
import type { Booking, BookingStatus, Service, Slot } from "@/lib/types";
import { todayKey } from "@/lib/seed";

type StatusFilter = "all" | BookingStatus;
type RangeFilter = "today" | "week" | "all";

function endOfWeek(now: Date) {
  const d = new Date(now);
  d.setDate(now.getDate() + 6);
  return d.toISOString().slice(0, 10);
}

export function BookingsList({
  bookings,
  services,
  slots,
}: {
  bookings: Booking[];
  services: Service[];
  slots: Slot[];
}) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [rangeFilter, setRangeFilter] = useState<RangeFilter>("all");

  const slotById = useMemo(() => new Map(slots.map((s) => [s.id, s])), [slots]);
  const serviceById = useMemo(
    () => new Map(services.map((s) => [s.id, s])),
    [services]
  );

  const today = todayKey();
  const weekEnd = endOfWeek(new Date());

  const filtered = useMemo(() => {
    return bookings
      .filter((b) => {
        if (statusFilter !== "all" && b.status !== statusFilter) return false;

        if (rangeFilter !== "all") {
          const slot = slotById.get(b.slotId);
          const date = slot?.date;
          if (!date) return false;
          if (rangeFilter === "today" && date !== today) return false;
          if (rangeFilter === "week" && (date < today || date > weekEnd)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [bookings, statusFilter, rangeFilter, slotById, today, weekEnd]);

  return (
    <div>
      <h1 className="text-xl font-bold text-brand-blue mb-4">All bookings</h1>

      <div className="card mb-4 space-y-3">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
            When
          </label>
          <div className="flex gap-2">
            {(
              [
                { id: "today", label: "Today" },
                { id: "week", label: "This Week" },
                { id: "all", label: "All" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setRangeFilter(opt.id)}
                className={`flex-1 rounded-xl py-2 text-sm font-bold ${
                  rangeFilter === opt.id
                    ? "bg-brand-blue text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
            Status
          </label>
          <div className="flex gap-2 overflow-x-auto">
            {(["all", "pending", "done", "cancelled"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`chip whitespace-nowrap ${
                  statusFilter === s
                    ? "bg-brand-blue text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {s[0].toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No bookings match"
          hint="Try clearing your filters."
        />
      ) : (
        <ul className="space-y-3">
          {filtered.map((b) => (
            <li key={b.id}>
              <BookingRow
                booking={b}
                service={serviceById.get(b.serviceId)}
                slot={slotById.get(b.slotId)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
