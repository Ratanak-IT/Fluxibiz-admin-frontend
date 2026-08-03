"use client";

import { useMemo } from "react";
import type { ShopPermission } from "@/lib/types/shopStaffTypes";

/**
 * Tick boxes for what a role may do, grouped the way the API groups them.
 * The catalogue comes from the server, so adding a permission on the backend
 * makes it appear here without touching this file.
 */
export function ShopPermissionPicker({
  catalogue,
  selected,
  onChange,
}: {
  catalogue: ShopPermission[];
  selected: string[];
  onChange: (keys: string[]) => void;
}) {
  const groups = useMemo(() => {
    const byGroup = new Map<string, ShopPermission[]>();

    catalogue.forEach((permission) => {
      const list = byGroup.get(permission.group) ?? [];
      list.push(permission);
      byGroup.set(permission.group, list);
    });

    return Array.from(byGroup.entries());
  }, [catalogue]);

  const toggle = (key: string) => {
    onChange(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]);
  };

  const toggleGroup = (keys: string[]) => {
    const allOn = keys.every((key) => selected.includes(key));

    onChange(
      allOn
        ? selected.filter((key) => !keys.includes(key))
        : Array.from(new Set([...selected, ...keys])),
    );
  };

  if (catalogue.length === 0) {
    return <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading permissions...</p>;
  }

  return (
    <div className="space-y-5">
      {groups.map(([group, permissions]) => {
        const keys = permissions.map((permission) => permission.key);
        const allOn = keys.every((key) => selected.includes(key));

        return (
          <fieldset key={group}>
            <div className="mb-2 flex items-baseline justify-between">
              <legend className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                {group}
              </legend>
              <button
                type="button"
                onClick={() => toggleGroup(keys)}
                className="text-xs text-green-700 hover:underline dark:text-green-400"
              >
                {allOn ? "Clear all" : "Select all"}
              </button>
            </div>

            <div className="space-y-1">
              {permissions.map((permission) => (
                <label
                  key={permission.key}
                  className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 transition hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(permission.key)}
                    onChange={() => toggle(permission.key)}
                    className="mt-0.5 size-4 accent-green-600"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm text-neutral-900 dark:text-neutral-50">
                      {permission.label}
                    </span>
                    <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                      {permission.hint}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}
