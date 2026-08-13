"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import type { ShopRole, StaffInviteRequest } from "@/lib/types/shopStaffTypes";

const PASSWORD_MIN_LENGTH = 8;

/** Readable but not guessable. They change it on first sign in anyway. */
function suggestPassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);

  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("") + "@1";
}

export function StaffInviteDialog({
  roles,
  busy,
  error,
  onCancel,
  onSubmit,
}: {
  roles: ShopRole[];
  busy: boolean;
  error?: string;
  onCancel: () => void;
  onSubmit: (values: Omit<StaffInviteRequest, "businessId">) => void;
}) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState(roles[0]?.id ?? "");

  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && onCancel();
    document.addEventListener("keydown", close);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", close);
      document.body.style.overflow = "";
    };
  }, [onCancel]);

  const passwordTooShort = password.length > 0 && password.length < PASSWORD_MIN_LENGTH;
  const canSubmit =
    username.trim() !== "" && email.trim() !== "" && roleId !== "" && !passwordTooShort && !busy;

  const selectedRole = roles.find((role) => role.id === roleId);

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
          Add someone to your shop
        </h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Pick the job they do. What that job is allowed to do is set on the role itself.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="staff-username">Username</label>
            <input id="staff-username" value={username} autoFocus
              onChange={(e) => setUsername(e.target.value)} className={field} />
          </div>
          <div>
            <label className={labelClass} htmlFor="staff-email">Email</label>
            <input id="staff-email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)} className={field} />
          </div>
          <div>
            <label className={labelClass} htmlFor="staff-first">First name</label>
            <input id="staff-first" value={firstName}
              onChange={(e) => setFirstName(e.target.value)} className={field} />
          </div>
          <div>
            <label className={labelClass} htmlFor="staff-last">Last name</label>
            <input id="staff-last" value={lastName}
              onChange={(e) => setLastName(e.target.value)} className={field} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="staff-phone">Phone</label>
            <input id="staff-phone" value={phoneNumber} placeholder="085333444"
              onChange={(e) => setPhoneNumber(e.target.value)} className={field} />
          </div>
        </div>

        <div className="mt-4">
          <label className={labelClass} htmlFor="staff-role">Role</label>
          <select id="staff-role" value={roleId}
            onChange={(e) => setRoleId(e.target.value)} className={field}>
            {roles.length === 0 && <option value="">No role yet</option>}
            {roles.map((role) => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>

          {selectedRole && (
            <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
              {selectedRole.permissions.length} permission
              {selectedRole.permissions.length === 1 ? "" : "s"}
              {selectedRole.description ? ` — ${selectedRole.description}` : ""}
            </p>
          )}

          {roles.length === 0 && (
            <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
              Create a role first, or use the ready made ones.
            </p>
          )}
        </div>

        <div className="mt-4">
          <label className={labelClass} htmlFor="staff-password">
            First password <span className="font-normal text-neutral-400">(optional)</span>
          </label>

          <div className="flex gap-2">
            {/* Plain text on purpose: you read it out to them and it stops
                working once they set their own. */}
            <input id="staff-password" type="text" value={password}
              placeholder="Leave empty to email them a link"
              onChange={(e) => setPassword(e.target.value)} className={field} />
            <button type="button" onClick={() => setPassword(suggestPassword())}
              title="Suggest a password"
              className="mt-1.5 shrink-0 rounded-lg border border-neutral-300 px-3 text-neutral-600 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800">
              <RefreshCw className="size-4" />
            </button>
          </div>

          {passwordTooShort ? (
            <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
              At least {PASSWORD_MIN_LENGTH} characters.
            </p>
          ) : (
            <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
              They must change it the first time they sign in.
            </p>
          )}
        </div>

        {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

        <div className="sticky bottom-0 -mx-6 -mb-6 mt-6 flex flex-col-reverse gap-2 border-t border-neutral-200 bg-white px-6 py-4 sm:flex-row sm:justify-end dark:border-neutral-800 dark:bg-neutral-900">
          <button type="button" onClick={onCancel}
            className="rounded-full border border-neutral-200 px-5 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-50 dark:hover:bg-neutral-800">
            Cancel
          </button>
          <button type="button" disabled={!canSubmit}
            onClick={() => onSubmit({
              username: username.trim(),
              email: email.trim(),
              firstName: firstName.trim() || undefined,
              lastName: lastName.trim() || undefined,
              phoneNumber: phoneNumber.trim() || undefined,
              temporaryPassword: password || undefined,
              businessRoleId: roleId,
            })}
            className="rounded-full bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:pointer-events-none disabled:opacity-50 dark:bg-green-500 dark:text-neutral-950 dark:hover:bg-green-400">
            {busy ? "Adding..." : "Add to shop"}
          </button>
        </div>
      </div>
    </div>
  );
}
