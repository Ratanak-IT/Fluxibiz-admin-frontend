"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export function DeleteConfirmDialog({
  title,
  description,
  confirmLabel = "Delete",
  busy,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
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
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 backdrop-blur-sm p-4">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-6 text-center shadow-xl"
      >
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-destructive/10">
          <AlertTriangle className="size-7 text-destructive" />
        </div>

        <h2 className="mt-4 text-lg font-semibold text-foreground">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full border border-border py-2.5 text-sm font-medium text-foreground transition hover:bg-accent"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="flex-1 rounded-full bg-destructive py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
          >
            {busy ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
