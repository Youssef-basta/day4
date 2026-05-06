"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createServiceAction,
  deleteServiceAction,
  updateServiceAction,
} from "@/app/admin/actions";
import type { Service, ServiceTier } from "@/lib/types";

type EditingState =
  | { mode: "create" }
  | { mode: "edit"; original: Service }
  | null;

const EMPTY: ServiceFormState = {
  id: "",
  name: "",
  durationMin: 30,
  priceKwd: 5,
  description: "",
  tier: "",
  sortOrder: 100,
  isActive: true,
};

type ServiceFormState = {
  id: string;
  name: string;
  durationMin: number;
  priceKwd: number;
  description: string;
  tier: ServiceTier | "";
  sortOrder: number;
  isActive: boolean;
};

export function ServicesManager({ services }: { services: Service[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<EditingState>(null);
  const [form, setForm] = useState<ServiceFormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function startCreate() {
    setForm(EMPTY);
    setEditing({ mode: "create" });
    setError(null);
  }

  function startEdit(s: Service) {
    setForm({
      id: s.id,
      name: s.name,
      durationMin: s.durationMin,
      priceKwd: s.priceKwd,
      description: s.description ?? "",
      tier: s.tier ?? "",
      sortOrder: 100,
      isActive: s.isActive,
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
          durationMin: form.durationMin,
          priceKwd: form.priceKwd,
          description: form.description,
          tier: form.tier === "" ? undefined : form.tier,
          sortOrder: form.sortOrder,
          isActive: form.isActive,
        };
        if (editing?.mode === "create") {
          await createServiceAction(payload);
        } else {
          await updateServiceAction(payload);
        }
        setEditing(null);
        router.refresh();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Could not save service");
      }
    });
  }

  function remove(id: string) {
    if (
      !confirm(
        "Remove this service? It will be hidden from customers; bookings that already used it remain intact."
      )
    )
      return;
    startTransition(async () => {
      try {
        await deleteServiceAction(id);
        router.refresh();
      } catch (e: unknown) {
        alert(e instanceof Error ? e.message : "Could not remove service");
      }
    });
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-brand-blue leading-tight">
            Services
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {services.length} total
          </p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="btn-primary !py-2 !px-3 text-sm"
        >
          + Add service
        </button>
      </div>

      {editing && (
        <div className="card mb-4 space-y-3">
          <h2 className="text-sm font-bold text-brand-blue">
            {editing.mode === "create" ? "New service" : `Edit ${editing.original.name}`}
          </h2>

          <Field
            label="ID"
            hint={
              editing.mode === "create"
                ? "lowercase, no spaces (e.g. fade)"
                : "ID cannot be changed"
            }
          >
            <input
              className="input"
              value={form.id}
              onChange={(e) => setForm({ ...form, id: e.target.value })}
              disabled={editing.mode === "edit"}
              placeholder="haircut"
            />
          </Field>

          <Field label="Name">
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Classic Haircut"
            />
          </Field>

          <Field label="Description">
            <input
              className="input"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Wash, scissor or clipper cut, and finish."
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Duration (min)">
              <input
                className="input"
                type="number"
                min={5}
                value={form.durationMin}
                onChange={(e) =>
                  setForm({ ...form, durationMin: Number(e.target.value) })
                }
              />
            </Field>
            <Field label="Price (KWD)">
              <input
                className="input"
                type="number"
                min={0}
                step={0.5}
                value={form.priceKwd}
                onChange={(e) =>
                  setForm({ ...form, priceKwd: Number(e.target.value) })
                }
              />
            </Field>
          </div>

          <Field label="Tier">
            <select
              className="input"
              value={form.tier}
              onChange={(e) =>
                setForm({
                  ...form,
                  tier: e.target.value as ServiceTier | "",
                })
              }
            >
              <option value="">Standard</option>
              <option value="premium">Premium</option>
              <option value="signature">Signature</option>
            </select>
          </Field>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="h-4 w-4"
            />
            Active (visible to customers)
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

      <ul className="space-y-3">
        {services.map((s) => {
          const tierLabel =
            s.tier === "premium"
              ? "Premium"
              : s.tier === "signature"
              ? "Signature"
              : null;
          return (
            <li key={s.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold">{s.name}</p>
                    {tierLabel && (
                      <span className="chip bg-brand-yellow text-brand-blue px-2 py-0.5 text-[10px]">
                        {tierLabel}
                      </span>
                    )}
                    {!s.isActive && (
                      <span className="chip bg-gray-200 text-gray-600 px-2 py-0.5 text-[10px]">
                        Hidden
                      </span>
                    )}
                  </div>
                  {s.description && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {s.description}
                    </p>
                  )}
                  <p className="text-[11px] text-gray-400 mt-1 font-mono">
                    {s.id}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-extrabold text-brand-blue">
                    {s.priceKwd} KWD
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {s.durationMin} min
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
