"use client";

import { useState } from "react";

/**
 * Suspend, disable and close all persist a reason into the audit log, so the
 * action is blocked until one is written. Nothing is destructive by accident.
 */
export function ReasonDialog({
  title,
  description,
  confirmLabel,
  busy,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
        <p className="mt-1 text-sm text-neutral-500">{description}</p>

        <label className="mt-5 block text-sm font-medium text-neutral-700" htmlFor="reason">
          Reason
        </label>
        <textarea
          id="reason"
          rows={3}
          value={reason}
          autoFocus
          onChange={(event) => setReason(event.target.value)}
          placeholder="This is recorded in the audit log"
          className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-green-600"
        />

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-neutral-300 px-5 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!reason.trim() || busy}
            onClick={() => onConfirm(reason.trim())}
            className="rounded-full bg-green-700 px-5 py-2 text-sm font-medium text-white transition hover:bg-green-800 disabled:opacity-50"
          >
            {busy ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
