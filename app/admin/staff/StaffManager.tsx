"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createStaffAction,
  deleteStaffAction,
  updateStaffAction,
} from "@/app/admin/actions";
import type { Staff } from "@/lib/types";

type EditingState =
  | { mode: "create" }
  | { mode: "edit"; original: Staff }
  | null;

type StaffFormState = {
  id: string;
  name: string;
  phone: string;
  isActive: boolean;
  sortOrder: number;
};

const EMPTY: StaffFormState = {
  id: "",
  name: "",
  phone: "",
  isActive: true,
  sortOrder: 100,
};

export function StaffManager({
  staff,
  todayCounts,
  upcomingCounts,
}: {
  staff: Staff[];
  todayCounts: Record<string, number>;
  upcomingCounts: Record<string, number>;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<EditingState>(null);
  const [form, setForm] = useState<StaffFormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function startCreate() {
    setForm(EMPTY);
    setEditing({ mode: "create" });
    setError(null);
  }

  function startEdit(s: Staff) {
    setForm({
      id: s.id,
      name: s.name,
      phone: s.phone ?? "",
      isActive: s.isActive,
      sortOrder: s.sortOrder,
    });
    setEditing({ mode: "edit", original: s });
    setError(null);
  }

  function cancel() {
    setEditing(null);
    setError(null);
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      try {
        const payload = {
          id: form.id.trim(),
          name: form.name,
          phone: form.phone.trim() || undefined,
          isActive: form.isActive,
          sortOrder: form.sortOrder,
        };
        if (editing?.mode === "create") {
          await createStaffAction(payload);
        } else {
          await updateStaffAction(payload);
        }
        setEditing(null);
        router.refresh();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Could not save staff");
      }
    });
  }

  function remove(id: string) {
    if (
      !confirm(
        "Remove this barber? Past bookings stay intact but lose the assignment."
      )
    )
      return;
    startTransition(async () => {
      try {
        await deleteStaffAction(id);
        router.refresh();
      } catch (e: unknown) {
        alert(e instanceof Error ? e.message : "Could not remove barber");
      }
    });
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-brand-blue leading-tight">
            Staff
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {staff.length} barber{staff.length === 1 ? "" : "s"}
          </p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="btn-primary !py-2 !px-3 text-sm"
        >
          + Add barber
        </button>
      </div>

      {editing && (
        <div className="card mb-4 space-y-3">
          <h2 className="text-sm font-bold text-brand-blue">
            {editing.mode === "create" ? "New barber" : `Edit ${editing.original.name}`}
          </h2>

          <Field
            label="ID"
            hint={
              editing.mode === "create"
                ? "lowercase, no spaces (e.g. ahmed)"
                : "ID cannot be changed"
            }
          >
            <input
              className="input"
              value={form.id}
              onChange={(e) => setForm({ ...form, id: e.target.value })}
              disabled={editing.mode === "edit"}
              placeholder="ahmed"
            />
          </Field>

          <Field label="Name">
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ahmed Al-Sabah"
            />
          </Field>

          <Field label="Phone (optional)">
            <input
              className="input"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+965 5000 0000"
              type="tel"
              inputMode="tel"
            />
          </Field>

          <Field label="Sort order" hint="Lower numbers appear first">
            <input
              className="input"
              type="number"
              value={form.sortOrder}
              onChange={(e) =>
                setForm({ ...form, sortOrder: Number(e.target.value) })
              }
            />
          </Field>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="h-4 w-4"
            />
            Active (available to assign new bookings)
          </label>

          {error && (
            <p className="text-sm text-red-600 font-semibold">{error}</p>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={cancel}
              className="btn-outline flex-1"
              disabled={pending}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              className="btn-primary flex-1"
              disabled={pending}
            >
              {pending ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}

      {staff.length === 0 ? (
        <div className="card text-center py-8 text-sm text-gray-600">
          No barbers yet. Tap{" "}
          <span className="font-semibold">+ Add barber</span> to create one.
        </div>
      ) : (
        <ul className="space-y-3">
          {staff.map((s) => {
            const upcoming = upcomingCounts[s.id] ?? 0;
            const todayPending = todayCounts[s.id] ?? 0;
            return (
              <li key={s.id} className="card">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold">{s.name}</p>
                      {!s.isActive && (
                        <span className="chip bg-gray-200 text-gray-600 px-2 py-0.5 text-[10px]">
                          Inactive
                        </span>
                      )}
                    </div>
                    {s.phone && (
                      <a
                        href={`tel:${s.phone}`}
                        className="text-xs text-brand-blue underline-offset-2 hover:underline"
                      >
                        {s.phone}
                      </a>
                    )}
                    <p className="text-[11px] text-gray-400 mt-0.5 font-mono">
                      {s.id}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-brand-blue">
                      {todayPending}
                    </p>
                    <p className="text-[10px] text-gray-500 uppercase">
                      Pending
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {upcoming} upcoming
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => startEdit(s)}
                    className="flex-1 rounded-lg border border-brand-blue text-brand-blue text-sm font-semibold py-2"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(s.id)}
                    className="flex-1 rounded-lg border border-red-300 text-red-600 text-sm font-semibold py-2"
                    disabled={pending}
                  >
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-gray-400 mt-0.5">{hint}</p>}
    </div>
  );
}
