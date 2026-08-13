"use client";

import { useEffect, useState } from "react";
import { ShopPermissionPicker } from "./ShopPermissionPicker";
import type { ShopPermission, ShopRole, ShopRoleRequest } from "@/lib/types/shopStaffTypes";

export function RoleFormDialog({
  role,
  catalogue,
  busy,
  error,
  onCancel,
  onSubmit,
}: {
  /** Present when editing an existing role. */
  role?: ShopRole;
  catalogue: ShopPermission[];
  busy: boolean;
  error?: string;
  onCancel: () => void;
  onSubmit: (values: ShopRoleRequest) => void;
}) {
  const [name, setName] = useState(role?.name ?? "");
  const [description, setDescription] = useState(role?.description ?? "");
  const [permissions, setPermissions] = useState<string[]>(role?.permissions ?? []);

  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && onCancel();
    document.addEventListener("keydown", close);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", close);
      document.body.style.overflow = "";
    };
  }, [onCancel]);

  const canSubmit = name.trim() !== "" && !busy;

  const field =
    "mt-1.5 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-gray-400 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50 dark:focus:border-gray-500";
  const labelClass = "block text-sm font-medium text-neutral-900 dark:text-neutral-50";

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-neutral-900/50 sm:place-items-center sm:p-4 dark:bg-black/70">
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl border border-neutral-200 bg-white p-6 shadow-xl sm:max-w-lg sm:rounded-2xl dark:border-neutral-800 dark:bg-neutral-900"
      >
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
          {role ? `Edit ${role.name}` : "New role"}
        </h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          A role is a job in your shop and the things that job is allowed to do.
        </p>

        <div className="mt-5">
          <label className={labelClass} htmlFor="role-name">Name</label>
          <input id="role-name" value={name} autoFocus placeholder="Cashier"
            onChange={(e) => setName(e.target.value)} className={field} />
        </div>

        <div className="mt-4">
          <label className={labelClass} htmlFor="role-description">
            Description <span className="font-normal text-neutral-400">(optional)</span>
          </label>
          <input id="role-description" value={description} placeholder="Takes orders at the counter"
            onChange={(e) => setDescription(e.target.value)} className={field} />
        </div>

        <div className="mt-6">
          <p className={labelClass}>What this role can do</p>
          <div className="mt-3">
            <ShopPermissionPicker
              catalogue={catalogue}
              selected={permissions}
              onChange={setPermissions}
            />
          </div>
        </div>

        {permissions.length === 0 && (
          <p className="mt-4 text-sm text-amber-600 dark:text-amber-400">
            Nothing ticked. Anyone with this role can sign in but do nothing.
          </p>
        )}

        {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

        {/* Sticky so the action stays reachable however long the list grows */}
        <div className="sticky bottom-0 -mx-6 -mb-6 mt-6 flex flex-col-reverse gap-2 border-t border-neutral-200 bg-white px-6 py-4 sm:flex-row sm:justify-end dark:border-neutral-800 dark:bg-neutral-900">
          <button type="button" onClick={onCancel}
            className="rounded-full border border-neutral-200 px-5 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-50 dark:hover:bg-neutral-800">
            Cancel
          </button>
          <button type="button" disabled={!canSubmit}
            onClick={() => onSubmit({
              name: name.trim(),
              description: description.trim() || null,
              permissions,
            })}
            className="rounded-full bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:pointer-events-none disabled:opacity-50 dark:bg-green-500 dark:text-neutral-950 dark:hover:bg-green-400">
            {busy ? "Saving..." : "Save role"}
          </button>
        </div>
      </div>
    </div>
  );
}
