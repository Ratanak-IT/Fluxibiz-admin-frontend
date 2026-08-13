"use client";

import { useEffect, useState } from "react";
import { ActionButton } from "@/components/ui-kit/Button";


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

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 backdrop-blur-sm p-4 text-left font-normal" dir="ltr">
      {/* Centred card modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full text-left rounded-2xl border border-border bg-card p-6 shadow-xl sm:max-w-md"
        dir="ltr"
      >
        <h2 className="text-lg font-semibold text-foreground text-left">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground text-left">{description}</p>

        <label className="mt-5 block text-sm font-medium text-foreground text-left" htmlFor="reason">
          Reason
        </label>
        <textarea
          id="reason"
          rows={3}
          value={reason}
          autoFocus
          onChange={(event) => setReason(event.target.value)}
          placeholder="Recorded in the audit log"
          className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground text-left outline-none transition placeholder:text-muted-foreground focus:border-gray-400 dark:focus:border-gray-500"
          dir="ltr"
        />

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <ActionButton onClick={onCancel}>Cancel</ActionButton>
          <ActionButton
            variant="primary"
            disabled={!reason.trim() || busy}
            onClick={() => onConfirm(reason.trim())}
          >
            {busy ? "Working..." : confirmLabel}
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
