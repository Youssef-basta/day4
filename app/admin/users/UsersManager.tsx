"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createAdminUserAction,
  deleteAdminUserAction,
  updateAdminUserAction,
} from "@/app/admin/actions";
import type { AdminRole, AdminUser } from "@/lib/types";

type Editing =
  | { mode: "create" }
  | { mode: "edit"; original: AdminUser }
  | null;

type FormState = {
  email: string;
  password: string;
  role: AdminRole;
  isActive: boolean;
};

const EMPTY: FormState = {
  email: "",
  password: "",
  role: "manager",
  isActive: true,
};

export function UsersManager({
  users,
  currentUserId,
}: {
  users: AdminUser[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Editing>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function startCreate() {
    setForm(EMPTY);
    setEditing({ mode: "create" });
    setError(null);
  }

  function startEdit(u: AdminUser) {
    setForm({
      email: u.email,
      password: "",
      role: u.role,
      isActive: u.isActive,
    });
    setEditing({ mode: "edit", original: u });
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
        if (editing?.mode === "create") {
          await createAdminUserAction({
            email: form.email,
            password: form.password,
            role: form.role,
            isActive: form.isActive,
          });
        } else if (editing?.mode === "edit") {
          await updateAdminUserAction(editing.original.id, {
            email: form.email,
            password: form.password || undefined,
            role: form.role,
            isActive: form.isActive,
          });
        }
        setEditing(null);
        router.refresh();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Could not save");
      }
    });
  }

  function remove(u: AdminUser) {
    if (!confirm(`Delete ${u.email}? This cannot be undone.`)) return;
    startTransition(async () => {
      try {
        await deleteAdminUserAction(u.id);
        router.refresh();
      } catch (e: unknown) {
        alert(e instanceof Error ? e.message : "Could not delete user");
      }
    });
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-brand-blue leading-tight">
            Admin users
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {users.length} account{users.length === 1 ? "" : "s"} · owners can
            manage everything; managers can run day-to-day bookings.
          </p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="btn-primary !py-2 !px-3 text-sm"
        >
          + Add user
        </button>
      </div>

      {editing && (
        <div className="card mb-4 space-y-3">
          <h2 className="text-sm font-bold text-brand-blue">
            {editing.mode === "create"
              ? "New admin user"
              : `Edit ${editing.original.email}`}
          </h2>

          <Field label="Email">
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="ahmed@joebarber.local"
              disabled={
                editing.mode === "edit" &&
                editing.original.id === currentUserId
              }
            />
          </Field>

          <Field
            label={editing.mode === "create" ? "Password" : "New password"}
            hint={
              editing.mode === "edit"
                ? "Leave blank to keep current password"
                : "Minimum 8 characters"
            }
          >
            <input
              className="input"
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              autoComplete="new-password"
              placeholder="••••••••"
            />
          </Field>

          <Field label="Role">
            <select
              className="input"
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value as AdminRole })
              }
            >
              <option value="manager">
                Manager (bookings, slots, customers)
              </option>
              <option value="owner">
                Owner (everything, including settings)
              </option>
            </select>
          </Field>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="h-4 w-4"
            />
            Active (can sign in)
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
        {users.map((u) => {
          const isYou = u.id === currentUserId;
          return (
            <li key={u.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold truncate">{u.email}</p>
                    <span
                      className={`chip px-2 py-0.5 text-[10px] ${
                        u.role === "owner"
                          ? "bg-brand-yellow text-brand-blue"
                          : "bg-blue-100 text-brand-blue"
                      }`}
                    >
                      {u.role}
                    </span>
                    {!u.isActive && (
                      <span className="chip bg-gray-200 text-gray-600 px-2 py-0.5 text-[10px]">
                        Inactive
                      </span>
                    )}
                    {isYou && (
                      <span className="chip bg-green-100 text-green-800 px-2 py-0.5 text-[10px]">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Added{" "}
                    {new Date(u.createdAt).toLocaleDateString(undefined, {
                      dateStyle: "medium",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => startEdit(u)}
                  className="flex-1 rounded-lg border border-brand-blue text-brand-blue text-sm font-semibold py-2"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => remove(u)}
                  disabled={isYou || pending}
                  className="flex-1 rounded-lg border border-red-300 text-red-600 text-sm font-semibold py-2 disabled:opacity-40"
                >
                  Delete
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="text-[11px] text-gray-500 mt-6 leading-snug">
        The legacy single-password fallback (set via{" "}
        <code className="font-mono">ADMIN_PASSWORD</code>) still works and
        signs you in as the seeded owner. Once you've set up real accounts
        you can remove the env var on Vercel to lock it down.
      </p>
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
