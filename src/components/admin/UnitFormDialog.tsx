"use client";

import { useEffect, useState } from "react";
import type { UnitResponse, UnitUpsertRequest } from "@/lib/types/unitTypes";

const NAME_MAX_LENGTH = 50;
const NOTE_MAX_LENGTH = 255;

interface Props {
  unit?: UnitResponse;
  busy: boolean;
  error?: string;
  onCancel: () => void;
  onSubmit: (values: UnitUpsertRequest) => void;
}

export function UnitFormDialog({ unit, busy, error, onCancel, onSubmit }: Props) {
  const [name, setName] = useState(unit?.name ?? "");
  const [note, setNote] = useState(unit?.note ?? "");

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };

    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [onCancel]);

  const trimmedName = name.trim();
  const canSubmit = trimmedName.length > 0 && !busy;

  const submit = () => {
    if (!canSubmit) return;
    onSubmit({ name: trimmedName, note: note.trim() || null });
  };

  return (
   <div className="fixed inset-0 z-50 grid place-items-end bg-black/50 backdrop-blur-sm sm:place-items-center sm:p-4">
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="unit-dialog-title"
    className="w-full rounded-t-2xl border border-border bg-card p-6 shadow-xl sm:max-w-md sm:rounded-2xl"
  >
    <h2
      id="unit-dialog-title"
      className="text-lg font-semibold text-card-foreground"
    >
      {unit ? "Edit unit" : "New unit"}
    </h2>
    <p className="mt-1 text-sm text-muted-foreground">
      Units are shared by every shop, so keep the names short and standard.
    </p>

    <label
      htmlFor="unit-name"
      className="mt-5 block text-sm font-medium text-card-foreground"
    >
      Name
    </label>
    <input
      id="unit-name"
      value={name}
      autoFocus
      maxLength={NAME_MAX_LENGTH}
      placeholder="Kilogram"
      onChange={(event) => setName(event.target.value)}
      onKeyDown={(event) => event.key === "Enter" && submit()}
      className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-ring"
    />

    <label
      htmlFor="unit-note"
      className="mt-4 block text-sm font-medium text-card-foreground"
    >
      Note <span className="font-normal text-muted-foreground">(optional)</span>
    </label>
    <textarea
      id="unit-note"
      rows={3}
      value={note}
      maxLength={NOTE_MAX_LENGTH}
      placeholder="Used for weighing rice and other dry goods"
      onChange={(event) => setNote(event.target.value)}
      className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-ring"
    />
    <p className="mt-1.5 text-xs text-muted-foreground">
      The web address is generated from the name automatically.
    </p>

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
        onClick={submit}
        className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
      >
        {busy ? "Saving..." : "Save"}
      </button>
    </div>
  </div>
</div>
  );
}