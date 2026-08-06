"use client";

import { useEffect, useRef, useState } from "react";
import { Columns3, Check } from "lucide-react";
import { ColumnVisibility } from "@/lib/hook/useColumnVisibility";

export function ColumnPicker({
  state,
  align = "right",
}: {
  state: ColumnVisibility;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const hiddenCount = state.hiddenIds.length;

  return (
    <div ref={wrapperRef} className="relative">
      <style>{state.css}</style>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm text-foreground transition hover:bg-accent"
      >
        <Columns3 className="size-4" aria-hidden />
        Columns
        {hiddenCount > 0 && (
          <span className="rounded-full bg-muted px-1.5 text-xs text-muted-foreground">
            {state.visibleCount}/{state.columns.length}
          </span>
        )}
      </button>

      {open && (
        <div
          className={[
            "absolute z-30 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-background py-1 shadow-lg",
            align === "right" ? "right-0" : "left-0",
          ].join(" ")}
        >
          {state.columns.map((column) => {
            const visible = !state.isHidden(column.id);
            const lastOne = visible && state.visibleCount <= 1;
            const disabled = column.locked || lastOne;

            return (
              <button
                key={column.id}
                type="button"
                disabled={disabled}
                onClick={() => state.toggle(column.id)}
                title={
                  column.locked
                    ? "This column is always shown"
                    : lastOne
                      ? "At least one column must stay visible"
                      : undefined
                }
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="grid size-4 shrink-0 place-items-center rounded border border-border">
                  {visible && <Check className="size-3" aria-hidden />}
                </span>
                <span className="truncate">{column.label}</span>
              </button>
            );
          })}

          {hiddenCount > 0 && (
            <>
              <div className="my-1 border-t border-border" />
              <button
                type="button"
                onClick={state.showAll}
                className="w-full px-3 py-2 text-left text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"
              >
                Show all columns
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}