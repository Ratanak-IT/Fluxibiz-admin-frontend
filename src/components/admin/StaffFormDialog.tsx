"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { PermissionPicker } from "./PermissionPicker";
import type { PlatformUserResponse } from "@/lib/types/adminTypes";
import { isHiddenRole } from "@/lib/permissionCatalog";

export interface StaffFormValues {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export function StaffFormDialog({
  user,
  availableRoles,
  busy,
  error,
  onCancel,
  onSubmit,
}: {
  user?: PlatformUserResponse;
  availableRoles: string[];
  busy: boolean;
  error?: string;
  onCancel: () => void;
  onSubmit: (values: StaffFormValues) => void;
}) {
  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [roles, setRoles] = useState<string[]>(
    (user?.roles ?? []).filter((role) => !isHiddenRole(role)),
  );

  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && onCancel();
    document.addEventListener("keydown", close);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", close);
      document.body.style.overflow = "";
    };
  }, [onCancel]);

  const editing = Boolean(user);
  const canSubmit =
    roles.length > 0 && !busy && (editing || (username.trim() !== "" && email.trim() !== ""));

  const field =
    "mt-1.5 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-gray-400 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50 dark:focus:border-gray-500";
  const labelClass = "block text-sm font-medium text-neutral-900 dark:text-neutral-50";

  return (
   <div className="fixed inset-0 z-50 grid place-items-end bg-black/50 sm:place-items-center sm:p-4">
  <div
    role="dialog"
    aria-modal="true"
    className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-2xl border border-border bg-card p-6 shadow-xl sm:max-w-lg sm:rounded-2xl"
  >
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold text-card-foreground">
        {editing ? `Permissions for ${user?.username}` : "New staff member"}
      </h2>
      <button
        type="button"
        onClick={onCancel}
        aria-label="Close dialog"
        className="rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition shrink-0"
      >
        <X className="size-4" />
      </button>
    </div>
    <p className="mt-1 text-sm text-muted-foreground">
      {editing
        ? "Ticking a box takes effect the next time they sign in."
        : "They receive an email to set their own password."}
    </p>

    {!editing && (
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="staff-username">
            Username
          </label>
          <input
            id="staff-username"
            value={username}
            autoFocus
            onChange={(e) => setUsername(e.target.value)}
            className={field}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="staff-email">
            Email
          </label>
          <input
            id="staff-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={field}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="staff-first">
            First name
          </label>
          <input
            id="staff-first"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={field}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="staff-last">
            Last name
          </label>
          <input
            id="staff-last"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={field}
          />
        </div>
      </div>
    )}

    <div className="mt-6">
      <p className={labelClass}>What they can do</p>
      <div className="mt-3">
        <PermissionPicker
          selected={roles}
          availableRoles={availableRoles}
          onChange={setRoles}
        />
      </div>
    </div>

    {roles.length === 0 && (
      <p className="mt-4 text-sm text-warning,#d97706">
        Pick at least one permission, otherwise they can sign in but see nothing.
      </p>
    )}

    {error && (
      <p className="mt-4 text-sm text-destructive">{error}</p>
    )}

    <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground"
      >
        Cancel
      </button>
      <button
        type="button"
        disabled={!canSubmit}
        onClick={() =>
          onSubmit({
            username: username.trim(),
            email: email.trim(),
            firstName,
            lastName,
            roles,
          })
        }
        className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
      >
        {busy ? "Saving..." : editing ? "Save permissions" : "Create and invite"}
      </button>
    </div>
  </div>
</div>
  );
}
