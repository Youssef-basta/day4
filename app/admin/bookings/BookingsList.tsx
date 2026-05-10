"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookingRow } from "@/components/BookingRow";
import { EmptyState } from "@/components/EmptyState";
import type {
  Booking,
  BookingStatus,
  Service,
  Slot,
  Staff,
} from "@/lib/types";
import { todayKey } from "@/lib/seed";

type StatusFilter = "all" | BookingStatus;
type RangeFilter = "today" | "week" | "all";
type StaffFilter = "all" | "unassigned" | string;

function endOfWeek(now: Date) {
  const d = new Date(now);
  d.setDate(now.getDate() + 6);
  return d.toISOString().slice(0, 10);
}

export function BookingsList({
  bookings,
  services,
  slots,
  staff,
}: {
  bookings: Booking[];
  services: Service[];
  slots: Slot[];
  staff: Staff[];
}) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [rangeFilter, setRangeFilter] = useState<RangeFilter>("all");
  const [staffFilter, setStaffFilter] = useState<StaffFilter>("all");

  const slotById = useMemo(() => new Map(slots.map((s) => [s.id, s])), [slots]);
  const serviceById = useMemo(
    () => new Map(services.map((s) => [s.id, s])),
    [services]
  );
  const staffById = useMemo(
    () => new Map(staff.map((s) => [s.id, s])),
    [staff]
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

        if (staffFilter === "unassigned" && b.staffId) return false;
        if (
          staffFilter !== "all" &&
          staffFilter !== "unassigned" &&
          b.staffId !== staffFilter
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [
    bookings,
    statusFilter,
    rangeFilter,
    staffFilter,
    slotById,
    today,
    weekEnd,
  ]);

  return (
    <div>
      <div className="flex items-end justify-between mb-4">
        <h1 className="text-xl font-bold text-brand-blue">All bookings</h1>
        <Link
          href="/admin/bookings/new"
          className="btn-primary !py-2 !px-3 text-sm"
        >
          + New booking
        </Link>
      </div>

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
        {staff.length > 0 && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Barber
            </label>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              <FilterChip
                active={staffFilter === "all"}
                onClick={() => setStaffFilter("all")}
              >
                All
              </FilterChip>
              <FilterChip
                active={staffFilter === "unassigned"}
                onClick={() => setStaffFilter("unassigned")}
              >
                Unassigned
              </FilterChip>
              {staff.map((s) => (
                <FilterChip
                  key={s.id}
                  active={staffFilter === s.id}
                  onClick={() => setStaffFilter(s.id)}
                >
                  {s.name}
                </FilterChip>
              ))}
            </div>
          </div>
        )}
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
                staff={b.staffId ? staffById.get(b.staffId) : undefined}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`chip whitespace-nowrap ${
        active ? "bg-brand-blue text-white" : "bg-gray-100 text-gray-600"
      }`}
    >
      {children}
    </button>
  );
}
