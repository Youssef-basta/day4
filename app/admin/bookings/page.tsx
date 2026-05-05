"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { BookingRow } from "@/components/BookingRow";
import { EmptyState } from "@/components/EmptyState";
import type { BookingStatus } from "@/lib/types";

type StatusFilter = "all" | BookingStatus;

export default function AdminBookingsPage() {
  const { bookings, getService, getSlot } = useStore();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFilter, setDateFilter] = useState<string>("");

  const filtered = useMemo(() => {
    return bookings
      .filter((b) => {
        if (statusFilter !== "all" && b.status !== statusFilter) return false;
        if (dateFilter) {
          const slot = getSlot(b.slotId);
          if (slot?.date !== dateFilter) return false;
        }
        return true;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [bookings, statusFilter, dateFilter, getSlot]);

  return (
    <div>
      <h1 className="text-xl font-bold text-brand-blue mb-4">All bookings</h1>

      <div className="card mb-4 space-y-3">
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
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
            Date
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              className="input flex-1"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            {dateFilter && (
              <button
                type="button"
                onClick={() => setDateFilter("")}
                className="btn-outline px-4"
              >
                Clear
              </button>
            )}
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
                service={getService(b.serviceId)}
                slot={getSlot(b.slotId)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
