"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";

export interface ColumnDef {
  /** stable key — used for storage, so don't rename casually */
  id: string;
  /** what shows in the picker */
  label: string;
  /** true = cannot be hidden */
  locked?: boolean;
}

export interface ColumnVisibility {
  columns: ColumnDef[];
  hiddenIds: string[];
  visibleCount: number;
  isHidden: (id: string) => boolean;
  toggle: (id: string) => void;
  showAll: () => void;
  /** put this on the <table> element */
  tableClassName: string;
  /** table min-width, shrunk proportionally as columns are hidden */
  minWidthRem: (base: number) => string;
  /** CSS that hides the chosen columns — rendered by <ColumnPicker> */
  css: string;
}

const storageKeyFor = (key: string) => `ipos:cols:${key}`;


export function useColumnVisibility(storageKey: string, columns: ColumnDef[]): ColumnVisibility {
  const rawId = useId();
  const tableClassName = useMemo(() => `cols-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`, [rawId]);

  const [hiddenIds, setHiddenIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKeyFor(storageKey));
      if (!saved) return;
      const parsed: unknown = JSON.parse(saved);
      if (!Array.isArray(parsed)) return;
      const known = new Set(columns.filter((c) => !c.locked).map((c) => c.id));
      setHiddenIds(parsed.filter((id): id is string => typeof id === "string" && known.has(id)));
    } catch {
    }
  }, [storageKey]);

  const persist = useCallback(
    (next: string[]) => {
      setHiddenIds(next);
      try {
        window.localStorage.setItem(storageKeyFor(storageKey), JSON.stringify(next));
      } catch {
      }
    },
    [storageKey],
  );

  const isHidden = useCallback((id: string) => hiddenIds.includes(id), [hiddenIds]);

  const visibleCount = columns.length - hiddenIds.length;

  const toggle = useCallback(
    (id: string) => {
      const column = columns.find((c) => c.id === id);
      if (!column || column.locked) return;

      if (hiddenIds.includes(id)) {
        persist(hiddenIds.filter((value) => value !== id));
        return;
      }
      if (columns.length - hiddenIds.length <= 1) return;
      persist([...hiddenIds, id]);
    },
    [columns, hiddenIds, persist],
  );

  const showAll = useCallback(() => persist([]), [persist]);

  const css = useMemo(() => {
    const rules = hiddenIds
      .map((id) => columns.findIndex((c) => c.id === id))
      .filter((index) => index >= 0)
      .map((index) => {
        const nth = index + 1;
        return (
          `.${tableClassName} > thead > tr > th:nth-child(${nth}),` +
          `.${tableClassName} > tbody > tr > td:nth-child(${nth}):not([colspan])` +
          `{display:none}`
        );
      });
    return rules.join("");
  }, [columns, hiddenIds, tableClassName]);

  const minWidthRem = useCallback(
    (base: number) =>
      `${Math.round(((base * visibleCount) / Math.max(columns.length, 1)) * 10) / 10}rem`,
    [columns.length, visibleCount],
  );

  return {
    columns,
    hiddenIds,
    visibleCount,
    isHidden,
    toggle,
    showAll,
    tableClassName,
    minWidthRem,
    css,
  };
}