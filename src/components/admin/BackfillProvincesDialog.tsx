"use client";

import { useEffect } from "react";
import { X, CheckCircle2, AlertTriangle } from "lucide-react";
import { ActionButton } from "@/components/ui-kit/Button";
import type { BackfillProvincesResponse } from "@/lib/types/adminTypes";

/**
 * Shows the result of the one-time cityOrProvince -> provinceName backfill:
 * how many businesses got matched automatically, and which ones didn't so
 * they can be followed up on (the owner fixes it via the map picker, or an
 * admin edits it directly) rather than silently left behind.
 */
export function BackfillProvincesDialog({
  result,
  onClose,
}: {
  result: BackfillProvincesResponse;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 backdrop-blur-sm p-4 text-left font-normal"
      dir="ltr"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Backfill provinces result"
        className="relative w-full text-left rounded-2xl border border-border bg-card p-6 shadow-xl sm:max-w-lg"
        dir="ltr"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground text-left">Backfill Provinces</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition shrink-0"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-400">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>
            <strong>{result.matchedCount}</strong> business{result.matchedCount === 1 ? "" : "es"} matched and
            updated.
          </span>
        </div>

        {result.unmatchedCount > 0 ? (
          <div className="mt-3">
            <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-400">
              <AlertTriangle className="size-4 shrink-0" />
              <span>
                <strong>{result.unmatchedCount}</strong> couldn&apos;t be matched automatically — left untouched.
              </span>
            </div>
            <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
              {result.unmatched.map((business) => (
                <li
                  key={business.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <span className="min-w-0 truncate font-medium text-foreground">{business.name}</span>
                  <span className="shrink-0 text-muted-foreground">{business.cityOrProvince}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-6 flex justify-end">
          <ActionButton variant="primary" onClick={onClose}>
            Done
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
